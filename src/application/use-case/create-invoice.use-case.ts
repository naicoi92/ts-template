import type { Invoice } from "../../domain/entity";
import { InvoiceAmountMisMatch } from "../../domain/error";
import type {
	CustomerRepository,
	InvoiceCodeGenerator,
	InvoiceRepository,
	Logger,
	UseCase,
} from "../../domain/interface";
import type { CreateInvoiceInputDto, CreateInvoiceOutputDto } from "../../domain/type";

export class CreateInvoiceUseCase implements UseCase<
	CreateInvoiceInputDto,
	CreateInvoiceOutputDto
> {
	constructor(
		private _deps: {
			logger: Logger;
			invoiceRepository: InvoiceRepository;
			customerRepository: CustomerRepository;
			invoiceCodeGenerator: InvoiceCodeGenerator;
		},
	) {}

	async execute(input: CreateInvoiceInputDto): Promise<CreateInvoiceOutputDto> {
		this.logger
			.withData({ orderId: input.orderId, email: input.email })
			.info("Creating invoice");

		const existingInvoice = await this.invoiceRepository.findByOrderId(input.orderId);
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
			return this.toInvoiceOutputDto(existingInvoice);
		}

		this.logger.withData({ email: input.email }).info("Finding or creating customer");
		const customer = await this.customerRepository.findOrCreateByEmail(input.email);

		const code = this.invoiceCodeGenerator.generate();
		const invoice = await this.invoiceRepository.create({
			code,
			orderId: input.orderId,
			amount: input.amount,
			customerId: customer.customerId,
		});

		this.logger
			.withData({ invoiceId: invoice.invoiceId, orderId: invoice.orderId })
			.info("Invoice created successfully");

		return this.toInvoiceOutputDto(invoice);
	}

	private toInvoiceOutputDto(_invoice: Invoice): CreateInvoiceOutputDto {
		return {};
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

	private get invoiceCodeGenerator(): InvoiceCodeGenerator {
		return this._deps.invoiceCodeGenerator;
	}
}
