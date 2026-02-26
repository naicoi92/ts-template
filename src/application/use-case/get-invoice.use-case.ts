import type { Invoice } from "../../domain/entity";
import type { InvoiceRepository, Logger } from "../../domain/interface";

export class GetInvoiceUseCase {
	constructor(
		private _deps: {
			logger: Logger;
			invoiceRepository: InvoiceRepository;
		},
	) {
		this.logger.debug("GetInvoiceUseCase initialized");
	}

	async execute(orderId: string): Promise<Invoice> {
		this.logger.withData({ orderId }).info("Fetching invoice by orderId");
		return await this.invoiceRepository.findByOrderId(orderId);
	}

	private get logger(): Logger {
		return this._deps.logger;
	}
	private get invoiceRepository(): InvoiceRepository {
		return this._deps.invoiceRepository;
	}
}
