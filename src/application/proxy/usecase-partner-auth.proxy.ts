import type { UseCase } from "../../domain/interface/usecase.interface";
import type { PartnerRepository } from "../../domain/interface/partner-repository.interface";
import type { SignatureVerifier } from "../../domain/interface/signature-verifier.interface";
import { PartnerAuthenticationError } from "../../domain/error/partner-authentication.error";

export type AuthContext = {
	partnerName: string;
	signature: string;
	canonicalString: string;
};

export class UseCasePartnerAuthProxy<I, O> implements UseCase<I, O> {
	constructor(private _deps: {
		useCase: UseCase<I, O>;
		partnerRepository: PartnerRepository;
		signatureVerifier: SignatureVerifier;
	}) {}

	async execute(input: I): Promise<O> {
		const context = input as AuthContext;

		if (!context.partnerName || !context.signature) {
			throw new PartnerAuthenticationError();
		}

		const partner = await this._deps.partnerRepository.findByName(context.partnerName);
		if (!partner) {
			throw new PartnerAuthenticationError();
		}

		const isValid = this._deps.signatureVerifier.verify(
			partner.token,
			context.canonicalString,
			context.signature,
		);
		if (!isValid) {
			throw new PartnerAuthenticationError();
		}

		return this._deps.useCase.execute(input);
	}
}
