import { inject, injectable } from "tsyringe";
import type { IAppBootstrap } from "@/domain/interfaces/app-bootstrap.interface";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import type { IServer } from "@/domain/interfaces/server.interface";
import type { Config } from "@/domain/types/config.types";
import { TOKENS } from "@/tokens";

/**
 * Application Bootstrap Service
 *
 * Smart & simple application lifecycle management
 * - Proper error handling & logging
 * - Graceful shutdown with timeout
 * - Health monitoring integration
 * - Clean separation of concerns
 */
@injectable()
export class AppBootstrapService implements IAppBootstrap {
	private isShuttingDown = false;
	private forceExitTimeout?: ReturnType<typeof setTimeout>;

	// Bootstrap constants - không cần environment variables
	private readonly SHUTDOWN_TIMEOUT = 10000; // 10 seconds
	private readonly HEALTH_CHECK_ENABLED = true;

	constructor(
		@inject(TOKENS.CONFIG_SERVICE) private readonly config: Config,
		@inject(TOKENS.LOGGER_SERVICE) private readonly logger: ILogger,
		@inject(TOKENS.SERVER) private readonly server: IServer,
	) {}

	/**
	 * Starts the application with proper setup
	 */
	async start(): Promise<void> {
		this.logger.info("Starting application...");

		try {
			this.setupGracefulShutdown();
			await this.server.start();

			if (this.HEALTH_CHECK_ENABLED) {
				this.logger.info("Health checks enabled");
			}

			this.logger
				.withData({
					port: this.config.port,
					nodeEnv: this.config.nodeEnv,
					appName: this.config.app.name,
				})
				.info("Application started successfully");
		} catch (error) {
			this.logger
				.withError(error as Error)
				.error("Failed to start application");
			throw error;
		}
	}

	/**
	 * Shuts down the application gracefully
	 */
	async shutdown(): Promise<void> {
		if (this.isShuttingDown) {
			this.logger.warn("Shutdown already in progress");
			return;
		}

		this.isShuttingDown = true;
		this.setupForceExit();

		try {
			this.logger.info("Starting graceful shutdown...");

			this.server.stop();

			this.logger.info("Graceful shutdown completed");
			process.exit(0);
		} catch (error) {
			this.logger
				.withError(error as Error)
				.error("Error during graceful shutdown");
			process.exit(1);
		}
	}

	/**
	 * Sets up graceful shutdown handlers for process signals
	 */
	private setupGracefulShutdown(): void {
		const signals = ["SIGTERM", "SIGINT"] as const;

		for (const signal of signals) {
			process.on(signal, () => {
				this.logger.info(`Received ${signal}, initiating shutdown`);
				this.shutdown();
			});
		}

		// Handle uncaught exceptions
		process.on("uncaughtException", (error) => {
			this.logger.withError(error).fatal("Uncaught exception, shutting down");
			process.exit(1);
		});

		process.on("unhandledRejection", (reason, promise) => {
			this.logger
				.withData({ promise, reason })
				.fatal("Unhandled promise rejection, shutting down");
			process.exit(1);
		});
	}

	/**
	 * Sets up force exit timeout to prevent hanging
	 */
	private setupForceExit(): void {
		// Clear any existing timeout
		if (this.forceExitTimeout) {
			clearTimeout(this.forceExitTimeout);
		}

		this.forceExitTimeout = setTimeout(() => {
			this.logger.error(
				`Graceful shutdown timeout (${this.SHUTDOWN_TIMEOUT}ms), forcing exit`,
			);
			process.exit(1);
		}, this.SHUTDOWN_TIMEOUT);
	}
}
