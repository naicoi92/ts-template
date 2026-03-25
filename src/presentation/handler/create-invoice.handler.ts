import { ProxyBuilder } from "../../application/builder/proxy.builder";
import { UseCaseLogProxy } from "../../application/proxy/usecase-log.proxy";
import { UseCasePartnerAuthProxy } from "../../application/proxy/usecase-partner-auth.proxy";
import { CreateInvoiceUseCase } from "../../application/use-case";
import type {
	CustomerRepository,
	Handler,
	InvoiceCodeGenerator,
	InvoiceRepository,
	Logger,
	PartnerRepository,
	SignatureVerifier,
	UseCase,
} from "../../domain/interface";
import { CreateInvoiceInputDtoSchema, CreateInvoiceOutputDtoSchema } from "../../domain/schema";
import type { CreateInvoiceInputDto, CreateInvoiceOutputDto } from "../../domain/type";
import type { RequestData } from "../../domain/interface/http-handler.interface";
import { CacheCustomerProxy } from "../../infrastructure/repositories/cache-customer.proxy";
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

		const cachedCustomerRepo = new ProxyBuilder<CustomerRepository>(this.customerRepository)
			.withProxy(CacheCustomerProxy)
			.build();

		const baseUseCase = new CreateInvoiceUseCase({
			logger,
			invoiceCodeGenerator: this.invoiceCodeGenerator,
			customerRepository: cachedCustomerRepo,
			invoiceRepository: this.invoiceRepository,
		});

		const useCase = new ProxyBuilder<UseCase<CreateInvoiceInputDto, CreateInvoiceOutputDto>>(
			baseUseCase,
		)
			.withProxy(UseCasePartnerAuthProxy, {
				authContext,
				partnerRepository: this.partnerRepository,
				signatureVerifier: this.signatureVerifier,
			})
			.withProxy(UseCaseLogProxy, { logger })
			.build();

		return await useCase.execute(data.body);
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
