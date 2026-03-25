import { ProxyBuilder } from "../../application/builder/proxy.builder";
import { UseCaseLogProxy } from "../../application/proxy/usecase-log.proxy";
import { UseCasePartnerAuthProxy } from "../../application/proxy/usecase-partner-auth.proxy";
import { GetInvoiceUseCase } from "../../application/use-case";
import type {
	Handler,
	InvoiceRepository,
	Logger,
	PartnerRepository,
	SignatureVerifier,
	UseCase,
} from "../../domain/interface";
import { GetInvoiceOutputDtoSchema, InvoiceParamsDtoSchema } from "../../domain/schema";
import type { GetInvoiceInputDto, GetInvoiceOutputDto, InvoiceParamsDto } from "../../domain/type";
import type { RequestData } from "../../domain/interface/http-handler.interface";
import { PartnerRequestAuthContextFactory } from "../factory/partner-request-auth-context.factory";

export class GetInvoiceHandler implements Handler<GetInvoiceOutputDto, InvoiceParamsDto> {
	readonly pathname = "/invoices/:orderId";
	readonly method = "GET";
	readonly paramsSchema = InvoiceParamsDtoSchema;
	readonly responseSchema = GetInvoiceOutputDtoSchema;

	constructor(
		private readonly _deps: {
			logger: Logger;
			invoiceRepository: InvoiceRepository;
			partnerRepository: PartnerRepository;
			signatureVerifier: SignatureVerifier;
			authContextFactory?: PartnerRequestAuthContextFactory;
		},
	) {}

	async handle(data: RequestData<InvoiceParamsDto, void, void>): Promise<GetInvoiceOutputDto> {
		const resolvedPathname = this.resolvePathname(data.params);
		const authContext = this.authContextFactory.create({
			headers: data.headers,
			method: this.method,
			pathname: resolvedPathname,
		});

		const logger = this.logger.withTraceId("ginv");
		logger.info("Initializing GetInvoiceUseCase");

		const baseUseCase = new GetInvoiceUseCase({
			logger,
			invoiceRepository: this.invoiceRepository,
		});

		const useCase = new ProxyBuilder<UseCase<GetInvoiceInputDto, GetInvoiceOutputDto>>(
			baseUseCase,
		)
			.withProxy(UseCasePartnerAuthProxy, {
				authContext,
				partnerRepository: this.partnerRepository,
				signatureVerifier: this.signatureVerifier,
			})
			.withProxy(UseCaseLogProxy, { logger })
			.build();

		return await useCase.execute({
			orderId: data.params.orderId,
		});
	}

	private get invoiceRepository(): InvoiceRepository {
		return this._deps.invoiceRepository;
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

	private get authContextFactory(): PartnerRequestAuthContextFactory {
		return this._deps.authContextFactory ?? new PartnerRequestAuthContextFactory();
	}

	private resolvePathname(params: InvoiceParamsDto): string {
		return this.pathname.replace(/:orderId/g, params.orderId);
	}
}
