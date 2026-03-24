import type { Partner } from "../../domain/entity/partner.entity";
import type { UseCase } from "../../domain/interface/usecase.interface";
import type { PartnerRepository } from "../../domain/interface/partner-repository.interface";
import type { SignatureVerifier } from "../../domain/interface/signature-verifier.interface";
import { PartnerNotFoundError } from "../../domain/error/partner.error";
import { PartnerAuthenticationError } from "../../domain/error/partner-authentication.error";

export type AuthContext = {
	partnerName: string;
	signature: string;
	canonicalString: string;
};

export class UseCasePartnerAuthProxy<I, O> implements UseCase<I, O> {
	constructor(
		private _deps: {
			useCase: UseCase<I, O>;
			partnerRepository: PartnerRepository;
			signatureVerifier: SignatureVerifier;
		},
	) {}

	async execute(input: I): Promise<O> {
		const context = input as AuthContext;

		if (!context.partnerName || !context.signature) {
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
