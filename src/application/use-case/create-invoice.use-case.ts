import type { Invoice } from "../../domain/entity";
import { InvoiceAmountMisMatch } from "../../domain/error";
import type {
	InvoiceCodeGenerator,
	InvoiceRepository,
	Logger,
} from "../../domain/interface";
import type { InvoiceCreateDto } from "../../domain/type";

export class CreateInvoiceUseCase {
	constructor(
		private _deps: {
			logger: Logger;
			invoiceRepository: InvoiceRepository;
			invoiceCodeGenerator: InvoiceCodeGenerator;
		},
	) {}

	async execute(input: InvoiceCreateDto): Promise<Invoice> {
		this.logger.withData({ orderId: input.orderId }).info("Creating invoice");

		const existingInvoice = await this.invoiceRepository.findByOrderId(
			input.orderId,
		);
		if (existingInvoice) {
			if (!existingInvoice.isAmountMatch(input.amount)) {
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

		const code = this.invoiceCodeGenerator.generate();
		const invoice = await this.invoiceRepository.create({
			code,
			orderId: input.orderId,
			amount: input.amount,
			customerId: input.customerId,
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

	private get invoiceCodeGenerator(): InvoiceCodeGenerator {
		return this._deps.invoiceCodeGenerator;
	}
}
