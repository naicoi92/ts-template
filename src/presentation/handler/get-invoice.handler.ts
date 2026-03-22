import { UseCaseLogProxy } from "../../application/proxy";
import { GetInvoiceUseCase } from "../../application/use-case";
import type { Handler, InvoiceRepository, Logger } from "../../domain/interface";
import { GetInvoiceOutputDtoSchema, InvoiceParamsDtoSchema } from "../../domain/schema";
import type { GetInvoiceOutputDto, InvoiceParamsDto } from "../../domain/type";

export class GetInvoiceHandler implements Handler<GetInvoiceOutputDto, InvoiceParamsDto> {
	readonly pathname = "/invoices/:orderId";
	readonly method = "GET";
	readonly paramsSchema = InvoiceParamsDtoSchema;
	readonly responseSchema = GetInvoiceOutputDtoSchema;

	constructor(
		private readonly _deps: {
			logger: Logger;
			invoiceRepository: InvoiceRepository;
		},
	) {}

	async handle(data: { params: InvoiceParamsDto }): Promise<GetInvoiceOutputDto> {
		return await this.getInvoiceUseCase.execute(data.params.orderId);
	}

	private get getInvoiceUseCase() {
		const logger = this.logger.withTraceId("ginv");
		logger.info("Initializing GetInvoiceUseCase");
		return new UseCaseLogProxy<string, GetInvoiceOutputDto>({
			useCase: new GetInvoiceUseCase({
				logger: logger,
				invoiceRepository: this.invoiceRepository,
			}),
			logger: logger,
		});
	}
	private get invoiceRepository(): InvoiceRepository {
		return this._deps.invoiceRepository;
	}

	private get logger(): Logger {
		return this._deps.logger;
	}
}
