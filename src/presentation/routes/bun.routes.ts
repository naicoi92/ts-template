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
			createInvoiceHandler: RequestHandler;
			getInvoiceHandler: RequestHandler;
			logger: Logger;
		},
	) {}

	get routes() {
		return {
			[this._deps.createInvoiceHandler.urlPattern.pathname]: {
				POST: (request: Request) => this.createInvoiceHandler.handle(request),
			},
			[this._deps.getInvoiceHandler.urlPattern.pathname]: {
				GET: (request: Request) => this.getInvoiceHandler.handle(request),
			},
		};
	}
	private get createInvoiceHandler(): FetchHandler {
		return this.createHandler(this._deps.createInvoiceHandler);
	}
	private get getInvoiceHandler(): FetchHandler {
		return this.createHandler(this._deps.getInvoiceHandler);
	}
	private createHandler(handler: RequestHandler): FetchHandler {
		return new FetchAdapter({ handler, logger: this.logger });
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
