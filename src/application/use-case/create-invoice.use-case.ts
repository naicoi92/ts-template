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
		this.logger
			.withData({ orderId: input.orderId, email: input.email })
			.info("Creating invoice");

		const existingInvoice = await this.invoiceRepository.findByOrderId(
			input.orderId,
		);
		if (existingInvoice) {
			if (existingInvoice.isAmountMatch(input.amount)) {
				this.logger
					.withData({
						orderId: input.orderId,
						expectedAmount: existingInvoice.amount,
						actualAmount: input.amount,
					})
					.error("Invoice amount mismatch");
				throw new InvoiceAmountMisMatch(
					input.orderId,
					existingInvoice.amount,
					input.amount,
				);
			}
			this.logger
				.withData({
					orderId: input.orderId,
					invoiceId: existingInvoice.invoiceId,
				})
				.info("Returning existing invoice");
			return existingInvoice;
		}

		this.logger
			.withData({ email: input.email })
			.info("Finding or creating customer");
		const customer = await this.customerRepository.findOrCreateByEmail(
			input.email,
		);

		const code = Date.now().toString();
		const invoice = await this.invoiceRepository.create({
			code,
			email: input.email,
			orderId: input.orderId,
			amount: input.amount,
			customerId: customer.id,
		});

		this.logger
			.withData({ invoiceId: invoice.invoiceId, orderId: invoice.orderId })
			.info("Invoice created successfully");

		return invoice;
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
