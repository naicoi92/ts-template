import type {
	FetchHandler,
	Logger,
	SimpleHandler,
} from "../../domain/interface";
import type { BunRouter } from "../../domain/interface/server.interface";
import { FetchAdapter } from "../adapter";

export class BunRoutes implements BunRouter {
	constructor(
		private readonly _deps: {
			createInvoiceHandler: SimpleHandler;
			logger: Logger;
		},
	) {}

	get routes() {
		return {
			"/invoices": {
				POST: (request: Request) => this.createInvoiceHandler.handle(request),
			},
		};
	}
	private get createInvoiceHandler(): FetchHandler {
		return this.createHandler(this._deps.createInvoiceHandler);
	}
	private createHandler(handler: SimpleHandler): FetchHandler {
		return new FetchAdapter({ handler, logger: this.logger });
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
