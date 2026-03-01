import type { CreateInvoiceUseCase } from "../../application/use-case/create-invoice.use-case";
import type { Handler, Logger } from "../../domain/interface";
import { InvoiceCreateDtoSchema } from "../../domain/schema";
import type { InvoiceCreateDto } from "../../domain/type";
import { ResponseFactory } from "../factory/response.factory";

export class CreateInvoiceHandler
	implements Handler<undefined, undefined, InvoiceCreateDto>
{
	readonly pathname = "/invoices";
	readonly method = "POST";
	readonly bodySchema = InvoiceCreateDtoSchema;

	constructor(
		private readonly _deps: {
			createInvoiceUseCase: CreateInvoiceUseCase;
			logger: Logger;
		},
	) {}

	async handle(data: {
		body: InvoiceCreateDto;
		request: Request;
	}): Promise<Response> {
		this.logger
			.withData({
				orderId: data.body.orderId,
			})
			.info("Processing create invoice request");

		const invoice = await this.createInvoiceUseCase.execute(data.body);

		this.logger
			.withData({
				invoiceId: invoice.invoiceId,
				orderId: invoice.orderId,
			})
			.info("Invoice created successfully");

		return ResponseFactory.created({
			id: invoice.invoiceId,
			orderId: invoice.orderId,
			amount: invoice.amount,
			customerId: invoice.customerId,
			email: invoice.email,
		});
	}
	private get createInvoiceUseCase(): CreateInvoiceUseCase {
		return this._deps.createInvoiceUseCase;
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
