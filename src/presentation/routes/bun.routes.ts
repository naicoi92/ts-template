import { fromPairs, map } from "lodash-es";
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
		return fromPairs(
			map(this.handlers, (handler) => [
				handler.pathname,
				(request: Request) => this.createHandler(handler).handle(request),
			]),
		);
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
