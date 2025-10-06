import { inject, injectable } from "tsyringe";
import type { IConfig } from "@/domain/interfaces/config.interface";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import type { IServer } from "@/domain/interfaces/server.interface";
import type { HealthController } from "@/presentation/controllers/health.controller";
import type { HelloController } from "@/presentation/controllers/hello.controller";
import { TOKENS } from "@/tokens";

@injectable()
export class BunServer implements IServer {
	private server?: ReturnType<typeof Bun.serve>;
	private abortController?: AbortController;

	constructor(
		@inject(TOKENS.CONFIG_SERVICE) private config: IConfig,
		@inject(TOKENS.LOGGER_SERVICE) private logger: ILogger,
		@inject(TOKENS.HEALTH_CONTROLLER)
		private healthController: HealthController,
		@inject(TOKENS.HELLO_CONTROLLER) private helloController: HelloController,
	) {}

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

	private async requestHandler(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const { pathname } = url;

		try {
			// Add CORS headers
			const corsHeaders = {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			};

			// Handle preflight requests
			if (request.method === "OPTIONS") {
				return new Response(null, { headers: corsHeaders });
			}

			// Router
			switch (pathname) {
				case "/health":
					return await this.handleHealth(corsHeaders);
				case "/hello":
					return await this.handleHello(corsHeaders);
				default:
					return this.handle404(corsHeaders);
			}
		} catch (error) {
			return this.handle500(error as Error);
		}
	}

	private errorHandler(error: Error): Response {
		this.logger.withError(error).error("Unhandled server error");
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	private async handleHealth(
		corsHeaders: Record<string, string>,
	): Promise<Response> {
		try {
			const result = await this.healthController.handle();
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: {
					...corsHeaders,
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			this.logger.withError(error as Error).error("Health check failed");
			return new Response(
				JSON.stringify({ status: "error", message: "Health check failed" }),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}
	}

	private async handleHello(
		corsHeaders: Record<string, string>,
	): Promise<Response> {
		try {
			const result = await this.helloController.handle();
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: {
					...corsHeaders,
					"Content-Type": "application/json",
				},
			});
		} catch (error) {
			this.logger.withError(error as Error).error("Hello endpoint failed");
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			});
		}
	}

	private handle404(corsHeaders: Record<string, string>): Response {
		return new Response(JSON.stringify({ error: "Not Found" }), {
			status: 404,
			headers: {
				...corsHeaders,
				"Content-Type": "application/json",
			},
		});
	}

	private handle500(error: Error): Response {
		this.logger.withError(error).error("Unhandled server error");
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
}
