import { describe, expect, test, beforeEach } from "bun:test";
import type { UseCase } from "../../../src/domain/interface/usecase.interface";
import { PartnerAuthenticationError } from "../../../src/domain/error/partner-authentication.error";
import { partnerFixtures } from "../../fixtures/partner.fixture";
import { MockLogger } from "../../mocks/logger.mock";
import { MockPartnerRepository } from "../../mocks/partner-repository.mock";
import { MockSignatureVerifier } from "../../mocks/signature-verifier.mock";
import { MockUseCase } from "../../mocks/usecase.mock";
import { UseCaseCompositionBuilder } from "../../../src/application/builder/use-case-composition.builder";

const validAuthContext = {
	partnerName: "partner-abc",
	signature: "valid-signature",
	request: {
		method: "POST",
		pathname: "/invoices",
		timestamp: "2024-01-15T10:00:00Z",
		data: { orderId: "ORDER-001", amount: 100 },
	},
} as const;

describe("UseCaseCompositionBuilder", () => {
	let mockUseCase: MockUseCase<object, { success: true; input: object }>;
	let logger: MockLogger;
	let partnerRepo: MockPartnerRepository;
	let signatureVerifier: MockSignatureVerifier;

	beforeEach(() => {
		mockUseCase = new MockUseCase<object, { success: true; input: object }>();
		logger = new MockLogger();
		partnerRepo = new MockPartnerRepository();
		signatureVerifier = new MockSignatureVerifier();
	});

	test("build() with no decorators returns the base use case", async () => {
		const composed = new UseCaseCompositionBuilder({ useCase: mockUseCase })
			.build();

		const input = { orderId: "ORDER-001" };
		const result = await composed.execute(input);

		expect(result).toEqual({ success: true, input });
		expect(mockUseCase.callCount).toBe(1);
	});

	test("build() with withLogging() wraps use case in log proxy", async () => {
		const composed = new UseCaseCompositionBuilder({ useCase: mockUseCase })
			.withLogging(logger)
			.build();

		await composed.execute({ orderId: "ORDER-001" });

		expect(logger.hasLog("info", "execute use case successfully")).toBe(true);
		expect(mockUseCase.callCount).toBe(1);
	});

	test("build() with withLogging() logs errors from inner use case", async () => {
		const failingUseCase = new MockUseCase<object, never>({
			execute: async () => {
				throw new Error("use case failed");
			},
		});

		const composed = new UseCaseCompositionBuilder({
			useCase: failingUseCase,
		})
			.withLogging(logger)
			.build();

		await expect(composed.execute({})).rejects.toThrow("use case failed");
		expect(logger.hasLog("error", "execute use case failed")).toBe(true);
	});

	test("build() with withPartnerAuthentication() wraps use case in auth proxy", async () => {
		const dto = partnerFixtures.valid();
		partnerRepo.seedPartner(dto);
		signatureVerifier.setDefaultValid(true);

		const composed = new UseCaseCompositionBuilder({ useCase: mockUseCase })
			.withPartnerAuthentication(
				validAuthContext,
				partnerRepo,
				signatureVerifier,
			)
			.build();

		const input = { orderId: "ORDER-001" };
		const result = await composed.execute(input);

		expect(result).toEqual({ success: true, input });
		expect(mockUseCase.callCount).toBe(1);
	});

	test("build() with withPartnerAuthentication() throws on invalid auth", async () => {
		signatureVerifier.setDefaultValid(false);
		const dto = partnerFixtures.valid();
		partnerRepo.seedPartner(dto);

		const composed = new UseCaseCompositionBuilder({ useCase: mockUseCase })
			.withPartnerAuthentication(
				validAuthContext,
				partnerRepo,
				signatureVerifier,
			)
			.build();

		await expect(composed.execute({})).rejects.toThrow(
			PartnerAuthenticationError,
		);
		expect(mockUseCase.callCount).toBe(0);
	});

	test("build() with both decorators applies auth inner, logging outer", async () => {
		const dto = partnerFixtures.valid();
		partnerRepo.seedPartner(dto);
		signatureVerifier.setDefaultValid(true);

		const composed = new UseCaseCompositionBuilder({ useCase: mockUseCase })
			.withPartnerAuthentication(
				validAuthContext,
				partnerRepo,
				signatureVerifier,
			)
			.withLogging(logger)
			.build();

		const input = { orderId: "ORDER-001" };
		const result = await composed.execute(input);

		expect(result).toEqual({ success: true, input });
		expect(logger.hasLog("info", "execute use case successfully")).toBe(true);
		expect(mockUseCase.callCount).toBe(1);
	});

	test("build() with both decorators — logging captures auth failure", async () => {
		signatureVerifier.setDefaultValid(false);
		const dto = partnerFixtures.valid();
		partnerRepo.seedPartner(dto);

		const composed = new UseCaseCompositionBuilder({ useCase: mockUseCase })
			.withPartnerAuthentication(
				validAuthContext,
				partnerRepo,
				signatureVerifier,
			)
			.withLogging(logger)
			.build();

		await expect(composed.execute({})).rejects.toThrow(
			PartnerAuthenticationError,
		);
		expect(logger.hasLog("error", "execute use case failed")).toBe(true);
		expect(mockUseCase.callCount).toBe(0);
	});

	test("fluent API returns this for chaining", () => {
		const builder = new UseCaseCompositionBuilder({ useCase: mockUseCase });

		const result = builder
			.withPartnerAuthentication(
				validAuthContext,
				partnerRepo,
				signatureVerifier,
			)
			.withLogging(logger);

		expect(result).toBe(builder);
	});

	test("build() preserves UseCase<I, O> typing", () => {
		const typedUseCase: UseCase<
			{ orderId: string },
			{ invoiceId: number }
		> = new MockUseCase<{ orderId: string }, { invoiceId: number }>({
			execute: async (input) => ({ invoiceId: 42 }),
		});

		const composed = new UseCaseCompositionBuilder({
			useCase: typedUseCase,
		})
			.withLogging(logger)
			.build();

		// Nếu type sai, TypeScript sẽ báo lỗi tại compile time
		const _typed: UseCase<{ orderId: string }, { invoiceId: number }> =
			composed;
		expect(_typed).toBeDefined();
	});
});
