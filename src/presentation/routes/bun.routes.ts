import { fromPairs, keys, map } from "lodash-es";
import type {
	Handler,
	Logger,
	RequestHandler,
	ResponseRender,
} from "../../domain/interface";
import { RequestAdapter } from "../adapter";
import { JsonRender } from "../render";

/**
 * Bun Routes
 *
 * Route registration for Bun.serve
 * All handlers must implement Handler interface
 */
export class BunRoutes {
	constructor(
		private readonly _deps: {
			handlers: Handler[];
			logger: Logger;
		},
	) {}

	get routes() {
		const routes = fromPairs(
			map(this.handlers, (handler) => [
				handler.pathname,
				(request: Request) => this.createAdapter(handler).handle(request),
			]),
		);

		this.logger
			.withData({
				keys: keys(routes),
			})
			.info("Registered routes");

		return routes;
	}

	/**
	 * Create RequestAdapter for handler
	 */
	private createAdapter(handler: Handler): RequestHandler<Request, Response> {
		return new RequestAdapter({
			handler,
			logger: this.logger,
			render: this.jsonRender,
		});
	}

	private get jsonRender(): ResponseRender<unknown, Response> {
		return new JsonRender({
			logger: this.logger,
		});
	}

	private get logger(): Logger {
		return this._deps.logger;
	}

	private get handlers(): Handler[] {
		return this._deps.handlers;
	}
}
