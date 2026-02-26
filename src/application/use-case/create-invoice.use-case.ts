import type { Invoice } from "../../domain/entity";
import { InvoiceAmountMisMatch } from "../../domain/error";
import type {
	CustomerRepository,
	InvoiceRepository,
	Logger,
} from "../../domain/interface";
import type { InvoiceCreateDto } from "../../domain/type";

export class CreateInvoiceUseCase {
	constructor(
		private _deps: {
			logger: Logger;
			invoiceRepository: InvoiceRepository;
			customerRepository: CustomerRepository;
		},
	) {
		this.logger.debug("CreateInvoiceUseCase initialized");
	}
	async execute(input: InvoiceCreateDto): Promise<Invoice> {
		const invoice = await this.invoiceRepository.findByOrderId(input.orderId);
		if (invoice) {
			if (invoice.isAmountMatch(input.amount))
				throw new InvoiceAmountMisMatch(
					input.orderId,
					invoice.amount,
					input.amount,
				);
			return invoice;
		}
		const customer = await this.customerRepository.findOrCreateByEmail(
			input.email,
		);
		const code = Date.now().toString();
		return await this.invoiceRepository.create({
			code,
			email: input.email,
			orderId: input.orderId,
			amount: input.amount,
			customerId: customer.id,
		});
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
	private get invoiceRepository(): InvoiceRepository {
		return this._deps.invoiceRepository;
	}
	private get customerRepository(): CustomerRepository {
		return this._deps.customerRepository;
	}
}
