import type { CreateInvoiceHandler } from "../handler/create-invoice.handler";

export class BunRoutes {
	constructor(
		private readonly _deps: {
			createInvoiceHandler: CreateInvoiceHandler;
		},
	) {}
	get routes() {
		return {
			"/invoices": {
				POST: (request: Request) => this.createInvoiceHandler.handle(request),
			},
		};
	}
	private get createInvoiceHandler() {
		return this._deps.createInvoiceHandler;
	}
}
