import type { BunRouter, Config, Logger, Server } from "../../domain/interface";
export class BunServer implements Server {
	#server?: Bun.Server<unknown>;

	constructor(
		private readonly _deps: {
			config: Config;
			logger: Logger;
			routes: BunRouter;
		},
	) {}
	async start(): Promise<void> {
		this.logger.withData({ port: this.port }).info("Starting server");

		this.#server = Bun.serve({
			port: this.port,
			routes: this.routes,
		});

		this.logger
			.withData({ port: this.port })
			.info("Server started successfully");
	}
	async stop(): Promise<void> {
		this.logger.info("Stopping server");

		if (this.#server) await this.#server.stop();

		this.logger.info("Server stopped");
	}
	private get port() {
		return this._deps.config.server.port;
	}
	private get routes() {
		return this._deps.routes.routes;
	}

	private get logger(): Logger {
		return this._deps.logger;
	}
}
