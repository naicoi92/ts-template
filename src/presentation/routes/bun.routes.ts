import { fromPairs, keys, map } from "lodash-es";
import type {
	FetchHandler,
	Logger,
	RequestHandler,
} from "../../domain/interface";
import type { BunRouter } from "../../domain/interface/server.interface";
import { FetchAdapter } from "../adapter";

export class BunRoutes implements BunRouter {
	constructor(
		private readonly _deps: {
			handlers: RequestHandler[];
			logger: Logger;
		},
	) {}

	get routes() {
		const routes = fromPairs(
			map(this.handlers, (handler) => [
				handler.pathname,
				(request: Request) => this.createHandler(handler).handle(request),
			]),
		);

		this.logger
			.withData({
				keys: keys(routes),
			})
			.info("Registered routes");

		return routes;
	}
	private createHandler(handler: RequestHandler): FetchHandler {
		return new FetchAdapter({ handler, logger: this.logger });
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
	private get handlers(): RequestHandler[] {
		return this._deps.handlers;
	}
}
