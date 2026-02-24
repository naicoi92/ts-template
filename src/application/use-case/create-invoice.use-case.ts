import type { Invoice } from "../../domain/entity";
import { InvoiceAmountMisMatch } from "../../domain/error";
import type {
	CustomerRepository,
	InvoiceRepository,
	Logger,
} from "../../domain/interface";
import { InvoiceCreateInputSchema } from "../../domain/schema";
import type { InvoiceCreateInput } from "../../domain/type";

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
	async execute(input: InvoiceCreateInput): Promise<Invoice> {
		const validatedInput = InvoiceCreateInputSchema.parse(input);
		const invoice = await this.invoiceRepository.findByOrderId(
			validatedInput.orderId,
		);
		if (invoice) {
			if (invoice.amount !== validatedInput.amount)
				throw new InvoiceAmountMisMatch(
					validatedInput.orderId,
					invoice.amount,
					validatedInput.amount,
				);
			return invoice;
		}
		const customer = await this.customerRepository.findOrCreateByEmail(
			validatedInput.email,
		);
		return await this.invoiceRepository.create({
			orderId: validatedInput.orderId,
			amount: validatedInput.amount,
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
