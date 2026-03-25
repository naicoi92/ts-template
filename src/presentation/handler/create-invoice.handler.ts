import { UseCaseCompositionBuilder } from "../../application/builder/use-case-composition.builder";
import { CreateInvoiceUseCase } from "../../application/use-case";
import type {
	CustomerRepository,
	Handler,
	InvoiceCodeGenerator,
	InvoiceRepository,
	Logger,
	PartnerRepository,
	SignatureVerifier,
} from "../../domain/interface";
import { CreateInvoiceInputDtoSchema, CreateInvoiceOutputDtoSchema } from "../../domain/schema";
import type { CreateInvoiceInputDto, CreateInvoiceOutputDto } from "../../domain/type";
import type { RequestData } from "../../domain/interface/http-handler.interface";
import { CachedCustomerRepositoryFactory } from "../../infrastructure/factory/cached-customer-repository.factory";
import { PartnerRequestAuthContextFactory } from "../factory/partner-request-auth-context.factory";

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
	private readonly _authContextFactory = new PartnerRequestAuthContextFactory();
	private readonly _cachedCustomerRepoFactory = new CachedCustomerRepositoryFactory();

	constructor(
		private readonly _deps: {
			logger: Logger;
			invoiceRepository: InvoiceRepository;
			customerRepository: CustomerRepository;
			invoiceCodeGenerator: InvoiceCodeGenerator;
			partnerRepository: PartnerRepository;
			signatureVerifier: SignatureVerifier;
		},
	) {}

	async handle(
		data: RequestData<void, void, CreateInvoiceInputDto>,
	): Promise<CreateInvoiceOutputDto> {
		const authContext = this._authContextFactory.create({
			headers: data.headers,
			method: this.method,
			pathname: this.pathname,
			data: data.body,
		});

		const logger = this.logger.withTraceId("cinv");
		const cachedCustomerRepo = this._cachedCustomerRepoFactory.create(this.customerRepository);

		const useCase = new CreateInvoiceUseCase({
			logger,
			invoiceCodeGenerator: this.invoiceCodeGenerator,
			customerRepository: cachedCustomerRepo,
			invoiceRepository: this.invoiceRepository,
		});

		const composedUseCase = new UseCaseCompositionBuilder<CreateInvoiceInputDto, CreateInvoiceOutputDto>({
			useCase,
		})
			.withPartnerAuthentication(authContext, this.partnerRepository, this.signatureVerifier)
			.withLogging(logger)
			.build();

		return await composedUseCase.execute(data.body);
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
	private get partnerRepository(): PartnerRepository {
		return this._deps.partnerRepository;
	}
	private get signatureVerifier(): SignatureVerifier {
		return this._deps.signatureVerifier;
	}
}
