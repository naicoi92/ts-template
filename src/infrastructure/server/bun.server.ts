import { inject, injectable } from "tsyringe";
import type { HttpRouter } from "@/application/services/http-router.service";
import type { IConfig } from "@/domain/interfaces/config.interface";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import type { IServer } from "@/domain/interfaces/server.interface";
import { TOKENS } from "@/tokens";

/**
 * Bun Server Implementation
 *
 * Single Responsibility: Manages Bun HTTP server lifecycle
 * - Only concerned with server start/stop operations
 * - Delegates request handling to HTTP router
 * - Handles platform-specific server configuration
 */
@injectable()
export class BunServer implements IServer {
	private server?: ReturnType<typeof Bun.serve>;
	private abortController?: AbortController;

	constructor(
		@inject(TOKENS.CONFIG_SERVICE) private readonly config: IConfig,
		@inject(TOKENS.LOGGER_SERVICE) private readonly logger: ILogger,
		@inject(TOKENS.HTTP_ROUTER) private readonly router: HttpRouter,
	) {}

	/**
	 * Starts the Bun HTTP server
	 */
	async start(): Promise<void> {
		this.logger
			.withData({
				port: this.config.port,
			})
			.info("Starting Bun server...");

		this.abortController = new AbortController();

		try {
			this.server = Bun.serve({
				port: this.config.port,
				hostname: "0.0.0.0",
				development: process.env.NODE_ENV === "development",
				fetch: this.requestHandler.bind(this),
				error: this.errorHandler.bind(this),
			});

			this.logger
				.withData({
					port: this.config.port,
					hostname: "0.0.0.0",
				})
				.info("Bun server started successfully");

			// Bun.serve doesn't have a finished promise like Deno.serve
			// We'll keep the server running until stop() is called
			await new Promise<void>((_, reject) => {
				this.abortController?.signal.addEventListener("abort", () => {
					reject(new Error("Server stopped"));
				});
			});
		} catch (error) {
			this.logger.withError(error as Error).error("Failed to start Bun server");
			throw error;
		}
	}

	/**
	 * Stops the Bun HTTP server
	 */
	stop(): void {
		if (this.server) {
			this.logger.info("Stopping Bun server...");
			this.server.stop();
			this.server = undefined;
		}
		if (this.abortController) {
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

	/**
	 * Handles server errors
	 * @param error - The error that occurred
	 * @returns Error response
	 */
	private errorHandler(error: Error): Response {
		this.logger.withError(error).error("Unhandled server error");

		return Response.json(
			{
				error: {
					code: "INTERNAL_SERVER_ERROR",
					message: "Internal server error",
				},
				timestamp: new Date().toISOString(),
			},
			{ status: 500 },
		);
	}
}
