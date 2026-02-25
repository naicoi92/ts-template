import type { CreateInvoiceUseCase } from "../../application/use-case/create-invoice.use-case";
import type { Logger, RequestHandler } from "../../domain/interface";
import { InvoiceCreateDtoSchema } from "../../domain/schema";
import type { InvoiceCreateDto } from "../../domain/type";
import { ResponseFactory } from "../factory/response.factory";

export class CreateInvoiceHandler
	implements RequestHandler<undefined, undefined, InvoiceCreateDto>
{
	readonly urlPattern = new URLPattern({
		pathname: "/invoices",
	});
	readonly bodySchema = InvoiceCreateDtoSchema;

	constructor(
		private readonly _deps: {
			useCase: CreateInvoiceUseCase;
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

		const invoice = await this.useCase.execute(data.body);

		this.logger
			.withData({
				invoiceId: invoice.id,
				orderId: invoice.orderId,
			})
			.info("Invoice created successfully");

		return ResponseFactory.created({
			id: invoice.id,
			orderId: invoice.orderId,
			amount: invoice.amount,
			customerId: invoice.customerId,
			email: invoice.email,
		});
	}
	private get useCase(): CreateInvoiceUseCase {
		return this._deps.useCase;
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
