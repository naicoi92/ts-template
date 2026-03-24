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
		const dto = partnerFixtures.valid();
		partnerRepo.seedPartner(dto);
		signatureVerifier.setDefaultValid(true);

		const { UseCasePartnerAuthProxy } = await import(
			"../../../src/application/proxy/usecase-partner-auth.proxy"
		);
		proxy = new UseCasePartnerAuthProxy({
			useCase: mockInnerUseCase as any,
			authContext: AuthContext,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		const input = { orderId: "ORDER-001" };
		const result = await proxy.execute(input);

		expect(result).toEqual({ success: true, input });
	});

	test("2. missing partnerName throws PartnerAuthenticationError", async () => {
		signatureVerifier.setDefaultValid(true);

		const { UseCasePartnerAuthProxy } = await import(
			"../../../src/application/proxy/usecase-partner-auth.proxy"
		);
		const authContextWithoutPartnerName = {
			partnerName: "",
			signature: "valid-signature",
			canonicalString: "canonical-data",
		};

		proxy = new UseCasePartnerAuthProxy({
			useCase: mockInnerUseCase as any,
			authContext: authContextWithoutPartnerName,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		await expect(proxy.execute({ orderId: "ORDER-001" })).rejects.toThrow(
			PartnerAuthenticationError,
		);
	});

	test("3. missing signature throws PartnerAuthenticationError", async () => {
		const dto = partnerFixtures.valid();
		partnerRepo.seedPartner(dto);

		const { UseCasePartnerAuthProxy } = await import(
			"../../../src/application/proxy/usecase-partner-auth.proxy"
		);
		const authContextWithoutSignature = {
			partnerName: "partner-abc",
			signature: "",
			canonicalString: "canonical-data",
		};

		proxy = new UseCasePartnerAuthProxy({
			useCase: mockInnerUseCase as any,
			authContext: authContextWithoutSignature,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		await expect(proxy.execute({ orderId: "ORDER-001" })).rejects.toThrow(
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
			authContext: AuthContext,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		await expect(proxy.execute({ orderId: "ORDER-001" })).rejects.toThrow(
			PartnerAuthenticationError,
		);
	});

	test("5. invalid signature throws PartnerAuthenticationError", async () => {
		const dto = partnerFixtures.valid();
		partnerRepo.seedPartner(dto);
		signatureVerifier.setDefaultValid(false);

		const { UseCasePartnerAuthProxy } = await import(
			"../../../src/application/proxy/usecase-partner-auth.proxy"
		);
		proxy = new UseCasePartnerAuthProxy({
			useCase: mockInnerUseCase as any,
			authContext: AuthContext,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		await expect(proxy.execute({ orderId: "ORDER-001" })).rejects.toThrow(
			PartnerAuthenticationError,
		);
	});

	test("6. inner use case is not called on auth failure", async () => {
		const dto = partnerFixtures.valid();
		partnerRepo.seedPartner(dto);
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
			authContext: AuthContext,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		await expect(proxy.execute({ orderId: "ORDER-001" })).rejects.toThrow(
			PartnerAuthenticationError,
		);
		expect(innerUseCaseCalled).toBe(false);
	});

	test("7. unexpected repository error propagates without converting to PartnerAuthenticationError", async () => {
		const { UseCasePartnerAuthProxy } = await import(
			"../../../src/application/proxy/usecase-partner-auth.proxy"
		);

		class ThrowingRepo extends MockPartnerRepository {
			override async findByName(_name: string): Promise<never> {
				throw new Error("database connection lost");
			}
		}

		proxy = new UseCasePartnerAuthProxy({
			useCase: mockInnerUseCase as any,
			authContext: AuthContext,
			partnerRepository: new ThrowingRepo(),
			signatureVerifier: signatureVerifier,
		});

		await expect(proxy.execute({ orderId: "ORDER-001" })).rejects.toThrow(
			"database connection lost",
		);
		await expect(proxy.execute({ orderId: "ORDER-001" })).rejects.not.toThrow(
			PartnerAuthenticationError,
		);
	});
});
