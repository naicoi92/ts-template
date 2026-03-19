import type { Invoice } from "../../domain/entity";
import type { InvoiceRepository, Logger, UseCase } from "../../domain/interface";
import type { GetInvoiceOutputDto } from "../../domain/type";

export class GetInvoiceUseCase implements UseCase<string, GetInvoiceOutputDto> {
	constructor(
		private _deps: {
			logger: Logger;
			invoiceRepository: InvoiceRepository;
		},
	) {
		this.logger.debug("GetInvoiceUseCase initialized");
	}

	async execute(orderId: string): Promise<GetInvoiceOutputDto> {
		this.logger.withData({ orderId }).info("Fetching invoice by orderId");
		const invoice = await this.invoiceRepository.findByOrderId(orderId);
		return this.toInvoiceOutputDto(invoice);
	}

	private toInvoiceOutputDto(_invoice: Invoice): GetInvoiceOutputDto {
		return {};
	}

	private get logger(): Logger {
		return this._deps.logger;
	}
	private get invoiceRepository(): InvoiceRepository {
		return this._deps.invoiceRepository;
	}
}
