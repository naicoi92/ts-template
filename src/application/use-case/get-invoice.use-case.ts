import type { Invoice } from "../../domain/entity";
import type { InvoiceRepository, Logger, UseCase } from "../../domain/interface";
import type { GetInvoiceInputDto, GetInvoiceOutputDto } from "../../domain/type";

export class GetInvoiceUseCase implements UseCase<GetInvoiceInputDto, GetInvoiceOutputDto> {
	constructor(
		private _deps: {
			logger: Logger;
			invoiceRepository: InvoiceRepository;
		},
	) {
		this.logger.debug("GetInvoiceUseCase initialized");
	}

	async execute(input: GetInvoiceInputDto): Promise<GetInvoiceOutputDto> {
		const { orderId } = input;
		this.logger.withData({ orderId }).info("Fetching invoice by orderId");
		const invoice = await this.invoiceRepository.findByOrderId(orderId);
		return this.toInvoiceOutputDto(invoice);
	}

	private toInvoiceOutputDto(invoice: Invoice): GetInvoiceOutputDto {
		return {
			orderId: invoice.orderId,
			invoiceId: invoice.invoiceId,
			code: invoice.code,
			amount: invoice.amount,
			status: invoice.status,
		};
	}

	private get logger(): Logger {
		return this._deps.logger;
	}
	private get invoiceRepository(): InvoiceRepository {
		return this._deps.invoiceRepository;
	}
}
