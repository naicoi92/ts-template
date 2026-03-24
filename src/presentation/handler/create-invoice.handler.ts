import {
	type AuthContext,
	buildCanonicalString,
	UseCaseLogProxy,
	UseCasePartnerAuthProxy,
} from "../../application/proxy";
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
import { CacheCustomerProxy } from "../../infrastructure/repositories/cache-customer.proxy";

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
			partnerRepository: PartnerRepository;
			signatureVerifier: SignatureVerifier;
		},
	) {}

	async handle(
		data: RequestData<void, void, CreateInvoiceInputDto>,
	): Promise<CreateInvoiceOutputDto> {
		const canonicalString = buildCanonicalString(this.method, this.pathname, data.body);
		const inputForUseCase: AuthContext & CreateInvoiceInputDto = {
			...data.body,
			partnerName: data.headers.get("x-partner-name") ?? "",
			signature: data.headers.get("x-signature") ?? "",
			canonicalString,
		};

		return await this.createInvoiceUseCase.execute(inputForUseCase);
	}

	private get createInvoiceUseCase() {
		const logger = this.logger.withTraceId("cinv");
		const actualUseCase = new CreateInvoiceUseCase({
			logger: logger,
			invoiceCodeGenerator: this.invoiceCodeGenerator,
			customerRepository: new CacheCustomerProxy({
				customerRepository: this.customerRepository,
			}),
			invoiceRepository: this.invoiceRepository,
		});
		return new UseCaseLogProxy<AuthContext, CreateInvoiceOutputDto>({
			useCase: new UseCasePartnerAuthProxy<AuthContext, CreateInvoiceOutputDto>({
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				useCase: actualUseCase as any,
				partnerRepository: this.partnerRepository,
				signatureVerifier: this.signatureVerifier,
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
	private get partnerRepository(): PartnerRepository {
		return this._deps.partnerRepository;
	}
	private get signatureVerifier(): SignatureVerifier {
		return this._deps.signatureVerifier;
	}
}
