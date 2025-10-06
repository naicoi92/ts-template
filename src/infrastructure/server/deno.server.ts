import { inject, injectable } from "tsyringe";
import type { HttpRouter } from "@/application/services/http-router.service";
import type { IConfig } from "@/domain/interfaces/config.interface";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import type { IServer } from "@/domain/interfaces/server.interface";
import { TOKENS } from "@/tokens";

declare global {
	const Deno: {
		serve(options: {
			port?: number;
			hostname?: string;
			signal?: AbortSignal;
			handler: (request: Request) => Response | Promise<Response>;
		}): { finished: Promise<void> };
	};
}

/**
 * Deno Server Implementation
 *
 * Single Responsibility: Manages Deno HTTP server lifecycle
 * - Only concerned with server start/stop operations
 * - Delegates request handling to HTTP router
 * - Handles platform-specific server configuration
 */
@injectable()
export class DenoServer implements IServer {
	private abortController?: AbortController;

	constructor(
		@inject(TOKENS.CONFIG_SERVICE) private readonly config: IConfig,
		@inject(TOKENS.LOGGER_SERVICE) private readonly logger: ILogger,
		@inject(TOKENS.HTTP_ROUTER) private readonly router: HttpRouter,
	) {}

	/**
	 * Starts the Deno HTTP server
	 */
	async start(): Promise<void> {
		this.logger
			.withData({
				port: this.config.port,
			})
			.info("Starting Deno server...");

		this.abortController = new AbortController();

		try {
			const server = Deno.serve({
				port: this.config.port,
				hostname: "0.0.0.0",
				signal: this.abortController.signal,
				handler: this.requestHandler.bind(this),
			});

			this.logger
				.withData({
					port: this.config.port,
					hostname: "0.0.0.0",
				})
				.info("Deno server started successfully");

			await server.finished;
		} catch (error) {
			this.logger
				.withError(error as Error)
				.error("Failed to start Deno server");
			throw error;
		}
	}

	/**
	 * Stops the Deno HTTP server
	 */
	stop(): void {
		if (this.abortController) {
			this.logger.info("Stopping Deno server...");
			this.abortController.abort();
		}
	}

	/**
	 * Handles HTTP requests using the HTTP router
	 * @param request - The incoming HTTP request
	 * @returns Promise resolving to HTTP response
	 */
	private async requestHandler(request: Request): Promise<Response> {
		return this.router.handle(request);
	}
}
