import type { GetInvoiceUseCase } from "../../application/use-case/get-invoice.use-case";
import type { Handler, Logger } from "../../domain/interface";
import {
	GetInvoiceResponseSchema,
	InvoiceParamsDtoSchema,
} from "../../domain/schema";
import type { GetInvoiceResponse, InvoiceParamsDto } from "../../domain/type";

export class GetInvoiceHandler
	implements Handler<GetInvoiceResponse, InvoiceParamsDto, undefined, undefined>
{
	readonly pathname = "/invoices/:orderId";
	readonly method = "GET";
	readonly paramsSchema = InvoiceParamsDtoSchema;
	readonly responseSchema = GetInvoiceResponseSchema;

	constructor(
		private readonly _deps: {
			getInvoiceUseCase: GetInvoiceUseCase;
			logger: Logger;
		},
	) {}

	async handle(data: {
		params: InvoiceParamsDto;
	}): Promise<GetInvoiceResponse> {
		this.logger
			.withData({ orderId: data.params.orderId })
			.info("Processing get invoice request");

		const invoice = await this.getInvoiceUseCase.execute(data.params.orderId);

		this.logger
			.withData({
				invoiceId: invoice.invoiceId,
				orderId: invoice.orderId,
			})
			.info("Invoice retrieved successfully");

		return {};
	}

	private get getInvoiceUseCase(): GetInvoiceUseCase {
		return this._deps.getInvoiceUseCase;
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
