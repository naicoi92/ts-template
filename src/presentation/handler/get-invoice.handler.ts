import type { GetInvoiceUseCase } from "../../application/use-case/get-invoice.use-case";
import type { Logger, RequestHandler } from "../../domain/interface";
import { InvoiceParamsDtoSchema } from "../../domain/schema";
import type { InvoiceParamsDto } from "../../domain/type";
import { ResponseFactory } from "../factory/response.factory";

export class GetInvoiceHandler
	implements RequestHandler<InvoiceParamsDto, undefined, undefined>
{
	readonly urlPattern = new URLPattern({
		pathname: "/invoices/:orderId",
	});
	readonly paramsSchema = InvoiceParamsDtoSchema;

	constructor(
		private readonly _deps: {
			useCase: GetInvoiceUseCase;
			logger: Logger;
		},
	) {}

	async handle(data: {
		params: InvoiceParamsDto;
		request: Request;
	}): Promise<Response> {
		this.logger
			.withData({
				orderId: data.params.orderId,
			})
			.info("Processing get invoice request");

		const invoice = await this.useCase.execute(data.params.orderId);

		this.logger
			.withData({
				invoiceId: invoice.invoiceId,
				orderId: invoice.orderId,
			})
			.info("Invoice retrieved successfully");

		return ResponseFactory.success({
			invoiceId: invoice.invoiceId,
			orderId: invoice.orderId,
			amount: invoice.amount,
			status: invoice.status,
			isPaid: invoice.isPaid,
		});
	}
	private get useCase(): GetInvoiceUseCase {
		return this._deps.useCase;
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
