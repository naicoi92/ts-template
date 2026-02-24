import type { RequestHandler } from "../../domain/interface/request-handler.interface";

export class CreateInvoiceHandler implements RequestHandler {
	async handle(): Promise<Response> {
		throw new Error("Method not implemented.");
	}
}
