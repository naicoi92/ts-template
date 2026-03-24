import {
	type AuthContext,
	buildCanonicalString,
	UseCaseLogProxy,
	UseCasePartnerAuthProxy,
} from "../../application/proxy";
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
		},
	) {}

	async handle(data: RequestData<InvoiceParamsDto, void, void>): Promise<GetInvoiceOutputDto> {
		const resolvedPathname = `/invoices/${data.params.orderId}`;
		const canonicalString = buildCanonicalString(this.method, resolvedPathname);
		const authContext: AuthContext = {
			partnerName: data.headers.get("x-partner-name") ?? "",
			signature: data.headers.get("x-signature") ?? "",
			canonicalString,
		};
		const inputForUseCase: GetInvoiceInputDto = {
			orderId: data.params.orderId,
		};

		return await this.getInvoiceUseCase(authContext).execute(inputForUseCase);
	}

	private getInvoiceUseCase(authContext: AuthContext): UseCase<GetInvoiceInputDto, GetInvoiceOutputDto> {
		const logger = this.logger.withTraceId("ginv");
		logger.info("Initializing GetInvoiceUseCase");
		return new UseCaseLogProxy<GetInvoiceInputDto, GetInvoiceOutputDto>({
			useCase: new UseCasePartnerAuthProxy<GetInvoiceInputDto, GetInvoiceOutputDto>({
				useCase: new GetInvoiceUseCase({
					logger: logger,
					invoiceRepository: this.invoiceRepository,
				}),
				authContext,
				partnerRepository: this.partnerRepository,
				signatureVerifier: this.signatureVerifier,
			}),
			logger: logger,
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
}
