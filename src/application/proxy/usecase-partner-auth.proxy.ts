import type { Partner } from "../../domain/entity/partner.entity";
import type { UseCase } from "../../domain/interface/usecase.interface";
import type { PartnerRepository } from "../../domain/interface/partner-repository.interface";
import type {
	SignatureVerificationRequest,
	SignatureVerifier,
} from "../../domain/interface/signature-verifier.interface";
import { PartnerNotFoundError } from "../../domain/error/partner.error";
import { PartnerAuthenticationError } from "../../domain/error/partner-authentication.error";

export type AuthContext = {
	partnerName: string;
	signature: string;
	request: SignatureVerificationRequest;
};

export class UseCasePartnerAuthProxy<I, O> implements UseCase<I, O> {
	constructor(
		private _deps: {
			useCase: UseCase<I, O>;
			authContext: AuthContext;
			partnerRepository: PartnerRepository;
			signatureVerifier: SignatureVerifier;
		},
	) {}

	async execute(input: I): Promise<O> {
		const context = this.authContext;

		if (!context.partnerName || !context.signature) {
			throw new PartnerAuthenticationError();
		}

		if (!context.request.method || !context.request.pathname) {
			throw new PartnerAuthenticationError();
		}

		let partner: Partner;
		try {
			partner = await this._deps.partnerRepository.findByName(context.partnerName);
		} catch (error) {
			if (error instanceof PartnerNotFoundError) {
				throw new PartnerAuthenticationError();
			}
			throw error;
		}

		const isValid = this._deps.signatureVerifier.verify({
			token: partner.token,
			signature: context.signature,
			request: context.request,
		});
		if (!isValid) {
			throw new PartnerAuthenticationError();
		}

		return this._deps.useCase.execute(input);
	}

	private get authContext(): AuthContext {
		return this._deps.authContext;
	}
}
