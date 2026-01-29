import type { CreateInvoiceUseCase } from "../../application/use-case/create-invoice.use-case";
import type { BunRouter } from "../../domain/interface";

export class InvoiceRouter implements BunRouter {
	constructor(
		private readonly _deps: { createInvoiceUseCase: CreateInvoiceUseCase },
	) {}
	async handle(request: Request): Promise<Response> {
		const data = await request.json();
		return Response.json(data);
	}
	get routes() {
		return {
			"/invoices": {
				POST: this.handle.bind(this),
			},
		};
	}
	private get createInvoiceUseCase() {
		return this._deps.createInvoiceUseCase;
	}
}
