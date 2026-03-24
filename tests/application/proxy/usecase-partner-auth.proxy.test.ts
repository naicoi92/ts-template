import { describe, expect, test, beforeEach } from "bun:test";
import { PartnerAuthenticationError } from "../../../src/domain/error/partner-authentication.error";
import { partnerFixtures } from "../../fixtures/partner.fixture";
import { MockPartnerRepository } from "../../mocks/partner-repository.mock";
import { MockSignatureVerifier } from "../../mocks/signature-verifier.mock";

const mockInnerUseCase = {
	execute: async (input: unknown) => ({ success: true, input }),
};

const AuthContext = {
	partnerName: "partner-abc",
	signature: "valid-signature",
	canonicalString: "canonical-data",
} as const;

describe("UseCasePartnerAuthProxy", () => {
	let partnerRepo: MockPartnerRepository;
	let signatureVerifier: MockSignatureVerifier;
	let proxy: {
		execute: (input: unknown) => Promise<unknown>;
	};

	beforeEach(async () => {
		partnerRepo = new MockPartnerRepository();
		signatureVerifier = new MockSignatureVerifier();
	});

	test("1. valid partner name + valid signature delegates to inner use case", async () => {
		const partner = partnerFixtures.valid();
		partnerRepo.seedPartner(partner);
		signatureVerifier.setDefaultValid(true);

		const { UseCasePartnerAuthProxy } = await import(
			"../../../src/application/proxy/usecase-partner-auth.proxy"
		);
		proxy = new UseCasePartnerAuthProxy({
			useCase: mockInnerUseCase as any,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		const result = await proxy.execute(AuthContext);

		expect(result).toEqual({ success: true, input: AuthContext });
	});

	test("2. missing partnerName throws PartnerAuthenticationError", async () => {
		signatureVerifier.setDefaultValid(true);

		const { UseCasePartnerAuthProxy } = await import(
			"../../../src/application/proxy/usecase-partner-auth.proxy"
		);
		proxy = new UseCasePartnerAuthProxy({
			useCase: mockInnerUseCase as any,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		const contextWithoutPartnerName = {
			signature: "valid-signature",
			canonicalString: "canonical-data",
		};

		await expect(proxy.execute(contextWithoutPartnerName)).rejects.toThrow(
			PartnerAuthenticationError,
		);
	});

	test("3. missing signature throws PartnerAuthenticationError", async () => {
		const partner = partnerFixtures.valid();
		partnerRepo.seedPartner(partner);

		const { UseCasePartnerAuthProxy } = await import(
			"../../../src/application/proxy/usecase-partner-auth.proxy"
		);
		proxy = new UseCasePartnerAuthProxy({
			useCase: mockInnerUseCase as any,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		const contextWithoutSignature = {
			partnerName: "partner-abc",
			canonicalString: "canonical-data",
		};

		await expect(proxy.execute(contextWithoutSignature)).rejects.toThrow(
			PartnerAuthenticationError,
		);
	});

	test("4. unknown partner throws PartnerAuthenticationError", async () => {
		signatureVerifier.setDefaultValid(true);

		const { UseCasePartnerAuthProxy } = await import(
			"../../../src/application/proxy/usecase-partner-auth.proxy"
		);
		proxy = new UseCasePartnerAuthProxy({
			useCase: mockInnerUseCase as any,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		await expect(proxy.execute(AuthContext)).rejects.toThrow(PartnerAuthenticationError);
	});

	test("5. invalid signature throws PartnerAuthenticationError", async () => {
		const partner = partnerFixtures.valid();
		partnerRepo.seedPartner(partner);
		signatureVerifier.setDefaultValid(false);

		const { UseCasePartnerAuthProxy } = await import(
			"../../../src/application/proxy/usecase-partner-auth.proxy"
		);
		proxy = new UseCasePartnerAuthProxy({
			useCase: mockInnerUseCase as any,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		await expect(proxy.execute(AuthContext)).rejects.toThrow(PartnerAuthenticationError);
	});

	test("6. inner use case is not called on auth failure", async () => {
		const partner = partnerFixtures.valid();
		partnerRepo.seedPartner(partner);
		signatureVerifier.setDefaultValid(false);

		let innerUseCaseCalled = false;
		const trackingUseCase = {
			execute: async () => {
				innerUseCaseCalled = true;
				return { success: true };
			},
		};

		const { UseCasePartnerAuthProxy } = await import(
			"../../../src/application/proxy/usecase-partner-auth.proxy"
		);
		proxy = new UseCasePartnerAuthProxy({
			useCase: trackingUseCase as any,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		await expect(proxy.execute(AuthContext)).rejects.toThrow(PartnerAuthenticationError);
		expect(innerUseCaseCalled).toBe(false);
	});
});
