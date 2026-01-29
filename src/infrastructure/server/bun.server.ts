import type { Config, Server } from "../../domain/interface";
import type { BunRoutes } from "../../presentation/routes";

export class BunServer implements Server {
	#server?: Bun.Server<unknown>;
	constructor(
		private readonly _deps: { config: Config; bunRoutes: BunRoutes },
	) {}
	async start(): Promise<void> {
		this.#server = Bun.serve({
			port: this.port,
			routes: this.routes,
		});
	}
	async stop(): Promise<void> {
		if (this.#server) await this.#server.stop();
	}
	private get port() {
		return this._deps.config.server.port;
	}
	private get routes() {
		return this._deps.bunRoutes.routes;
	}
}
