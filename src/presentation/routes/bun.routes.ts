import { fromPairs, keys, map } from "lodash-es";
import type { Handler, Logger, RequestHandler, ResponseRender } from "../../domain/interface";
import type { HeaderProvider } from "../../domain/interface/header-provider.interface";
import { RequestAdapter } from "../adapter";
import type { RequestBodyParser } from "../adapter/body-parser";
import { ErrorMapper, JsonRender } from "../render";

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
			bodyParsers: RequestBodyParser[];
			headerProviderFactory: (headers: Headers) => HeaderProvider;
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
			bodyParsers: this._deps.bodyParsers,
			headerProviderFactory: this._deps.headerProviderFactory,
		});
	}

	private get jsonRender(): ResponseRender<unknown, Response> {
		return new JsonRender({ errorMapper: new ErrorMapper(), logger: this.logger });
	}

	private get logger(): Logger {
		return this._deps.logger;
	}

	private get handlers(): Handler[] {
		return this._deps.handlers;
	}
}
