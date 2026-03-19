import { UseCaseLogProxy } from "../../application/proxy";
import { CreateInvoiceUseCase } from "../../application/use-case";
import type {
	CustomerRepository,
	Handler,
	InvoiceCodeGenerator,
	InvoiceRepository,
	Logger,
} from "../../domain/interface";
import { CreateInvoiceInputDtoSchema, CreateInvoiceOutputDtoSchema } from "../../domain/schema";
import type { CreateInvoiceInputDto, CreateInvoiceOutputDto } from "../../domain/type";

export class CreateInvoiceHandler implements Handler<
	CreateInvoiceOutputDto,
	void,
	void,
	CreateInvoiceInputDto
> {
	readonly pathname = "/invoices";
	readonly method = "POST";
	readonly bodySchema = CreateInvoiceInputDtoSchema;
	readonly responseSchema = CreateInvoiceOutputDtoSchema;
	constructor(
		private readonly _deps: {
			logger: Logger;
			invoiceRepository: InvoiceRepository;
			customerRepository: CustomerRepository;
			invoiceCodeGenerator: InvoiceCodeGenerator;
		},
	) {}

	async handle(data: { body: CreateInvoiceInputDto }): Promise<CreateInvoiceOutputDto> {
		return await this.createInvoiceUseCase.execute(data.body);
	}

	private get createInvoiceUseCase() {
		const logger = this.logger.withTraceId("cinv");
		return new UseCaseLogProxy<CreateInvoiceInputDto, CreateInvoiceOutputDto>({
			useCase: new CreateInvoiceUseCase({
				logger: logger,
				invoiceCodeGenerator: this.invoiceCodeGenerator,
				customerRepository: this.customerRepository,
				invoiceRepository: this.invoiceRepository,
			}),
			logger: logger,
		});
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
	private get logger(): Logger {
		return this._deps.logger;
	}
}
