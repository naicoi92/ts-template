import { container } from "../../container";
import type { Config, Server } from "../../domain/interface";
import { BunRoutes } from "../../presentation/routes";

export class BunServer implements Server {
	#server?: Bun.Server<unknown>;
	#bunRoutes: BunRoutes;
	constructor(private readonly _deps: { config: Config }) {
		this.#bunRoutes = container.build(BunRoutes);
	}
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
		return this.#bunRoutes.routes;
	}
}
