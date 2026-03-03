import type { CreateInvoiceUseCase } from "../../application/use-case/create-invoice.use-case";
import type { Handler, Logger } from "../../domain/interface";
import {
	CreateInvoiceResponseSchema,
	InvoiceCreateDtoSchema,
} from "../../domain/schema";
import type {
	CreateInvoiceResponse,
	InvoiceCreateDto,
} from "../../domain/type";

export class CreateInvoiceHandler
	implements Handler<CreateInvoiceResponse, void, void, InvoiceCreateDto>
{
	readonly pathname = "/invoices";
	readonly method = "POST";
	readonly bodySchema = InvoiceCreateDtoSchema;
	readonly responseSchema = CreateInvoiceResponseSchema;

	constructor(
		private readonly _deps: {
			createInvoiceUseCase: CreateInvoiceUseCase;
			logger: Logger;
		},
	) {}

	async handle(data: {
		body: InvoiceCreateDto;
	}): Promise<CreateInvoiceResponse> {
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
		return {};
	}
	private get createInvoiceUseCase(): CreateInvoiceUseCase {
		return this._deps.createInvoiceUseCase;
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
