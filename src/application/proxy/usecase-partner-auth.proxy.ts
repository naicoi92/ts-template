import type { Partner } from "../../domain/entity/partner.entity";
import type { UseCase } from "../../domain/interface/usecase.interface";
import type { PartnerRepository } from "../../domain/interface/partner-repository.interface";
import type { SignatureVerifier } from "../../domain/interface/signature-verifier.interface";
import type { PartnerAuthSource } from "../../domain/type/partner-auth-source.type";
import { PartnerNotFoundError } from "../../domain/error/partner.error";
import { PartnerAuthenticationError } from "../../domain/error/partner-authentication.error";

export class UseCasePartnerAuthProxy<I, O> implements UseCase<I, O> {
	constructor(
		private target: UseCase<I, O>,
		private deps: {
			authSource: PartnerAuthSource;
			partnerRepository: PartnerRepository;
			signatureVerifier: SignatureVerifier;
		},
	) {}

	async execute(input: I): Promise<O> {
		const authSource = this.deps.authSource;

		const partnerName = authSource.headers.get("x-partner-name") ?? "";
		const signature = authSource.headers.get("x-signature") ?? "";
		const timestamp = authSource.headers.get("x-timestamp") ?? "";

		if (!partnerName || !signature) {
			throw new PartnerAuthenticationError();
		}

		if (!authSource.method || !authSource.pathname || !timestamp) {
			throw new PartnerAuthenticationError();
		}

		let partner: Partner;
		try {
			partner = await this.deps.partnerRepository.findByName(partnerName);
		} catch (error) {
			if (error instanceof PartnerNotFoundError) {
				throw new PartnerAuthenticationError();
			}
			throw error;
		}

		const isValid = this.deps.signatureVerifier.verify({
			token: partner.token,
			signature: signature,
			request: {
				method: authSource.method,
				pathname: authSource.pathname,
				timestamp,
			},
		});
		if (!isValid) {
			throw new PartnerAuthenticationError();
		}

		return this.target.execute(input);
	}
}
