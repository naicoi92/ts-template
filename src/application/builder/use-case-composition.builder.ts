import type { Logger, UseCase } from "../../domain/interface";
import type { PartnerRepository } from "../../domain/interface/partner-repository.interface";
import type { SignatureVerifier } from "../../domain/interface/signature-verifier.interface";
import { UseCaseLogProxy } from "../proxy/usecase-log.proxy";
import {
	type AuthContext,
	UseCasePartnerAuthProxy,
} from "../proxy/usecase-partner-auth.proxy";

export class UseCaseCompositionBuilder<I, O> {
	constructor(
		private _deps: {
			useCase: UseCase<I, O>;
		},
	) {}

	private _authConfig?: {
		authContext: AuthContext;
		partnerRepository: PartnerRepository;
		signatureVerifier: SignatureVerifier;
	};

	private _logger?: Logger;

	withPartnerAuthentication(
		authContext: AuthContext,
		partnerRepository: PartnerRepository,
		signatureVerifier: SignatureVerifier,
	): this {
		this._authConfig = { authContext, partnerRepository, signatureVerifier };
		return this;
	}

	withLogging(logger: Logger): this {
		this._logger = logger;
		return this;
	}

	build(): UseCase<I, O> {
		let composed: UseCase<I, O> = this.useCase;

		if (this._authConfig) {
			composed = new UseCasePartnerAuthProxy({
				useCase: composed,
				authContext: this._authConfig.authContext,
				partnerRepository: this._authConfig.partnerRepository,
				signatureVerifier: this._authConfig.signatureVerifier,
			});
		}

		if (this._logger) {
			composed = new UseCaseLogProxy({
				useCase: composed,
				logger: this._logger,
			});
		}

		return composed;
	}

	private get useCase(): UseCase<I, O> {
		return this._deps.useCase;
	}
}
