import { describe, expect, test, beforeEach } from "bun:test";
import type { UseCase } from "../../../src/domain/interface/usecase.interface";
import { PartnerAuthenticationError } from "../../../src/domain/error/partner-authentication.error";
import { partnerFixtures } from "../../fixtures/partner.fixture";
import { MockPartnerRepository } from "../../mocks/partner-repository.mock";
import { MockSignatureVerifier } from "../../mocks/signature-verifier.mock";
import { MockUseCase } from "../../mocks/usecase.mock";

const mockInnerUseCase = new MockUseCase<object, { success: true; input: object }>();

const AuthContext = {
	partnerName: "partner-abc",
	signature: "valid-signature",
	request: {
		method: "POST",
		pathname: "/invoices",
		timestamp: "2024-01-15T10:00:00Z",
		data: { orderId: "ORDER-001", amount: 100 },
	},
} as const;

describe("UseCasePartnerAuthProxy", () => {
	let partnerRepo: MockPartnerRepository;
	let signatureVerifier: MockSignatureVerifier;
	let proxy: UseCase<object, unknown>;

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
		proxy = new UseCasePartnerAuthProxy(mockInnerUseCase, {
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
			request: {
				method: "POST",
				pathname: "/invoices",
				timestamp: "2024-01-15T10:00:00Z",
				data: { orderId: "ORDER-001", amount: 100 },
			},
		};

		proxy = new UseCasePartnerAuthProxy(mockInnerUseCase, {
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
			request: {
				method: "POST",
				pathname: "/invoices",
				timestamp: "2024-01-15T10:00:00Z",
				data: { orderId: "ORDER-001", amount: 100 },
			},
		};

		proxy = new UseCasePartnerAuthProxy(mockInnerUseCase, {
			authContext: authContextWithoutSignature,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		await expect(proxy.execute({ orderId: "ORDER-001" })).rejects.toThrow(
			PartnerAuthenticationError,
		);
	});

	test("3b. missing timestamp throws PartnerAuthenticationError", async () => {
		const dto = partnerFixtures.valid();
		partnerRepo.seedPartner(dto);
		signatureVerifier.setDefaultValid(true);

		const { UseCasePartnerAuthProxy } = await import(
			"../../../src/application/proxy/usecase-partner-auth.proxy"
		);
		const authContextWithoutTimestamp = {
			partnerName: "partner-abc",
			signature: "valid-signature",
			request: {
				method: "POST",
				pathname: "/invoices",
				timestamp: "",
				data: { orderId: "ORDER-001", amount: 100 },
			},
		};

		proxy = new UseCasePartnerAuthProxy(mockInnerUseCase, {
			authContext: authContextWithoutTimestamp,
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
		proxy = new UseCasePartnerAuthProxy(mockInnerUseCase, {
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
		proxy = new UseCasePartnerAuthProxy(mockInnerUseCase, {
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

		const trackingUseCase = new MockUseCase<object, { success: true }>({
			execute: async () => {
				return { success: true };
			},
		});

		const { UseCasePartnerAuthProxy } = await import(
			"../../../src/application/proxy/usecase-partner-auth.proxy"
		);
		proxy = new UseCasePartnerAuthProxy(trackingUseCase, {
			authContext: AuthContext,
			partnerRepository: partnerRepo,
			signatureVerifier: signatureVerifier,
		});

		await expect(proxy.execute({ orderId: "ORDER-001" })).rejects.toThrow(
			PartnerAuthenticationError,
		);
		expect(trackingUseCase.callCount).toBe(0);
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

		proxy = new UseCasePartnerAuthProxy(mockInnerUseCase, {
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
