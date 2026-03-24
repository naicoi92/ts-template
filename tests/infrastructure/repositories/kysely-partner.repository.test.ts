import { beforeEach, describe, expect, test } from "bun:test";
import { NoResultError } from "kysely";
import { KyselyPartnerRepository } from "../../../src/infrastructure/repositories/kysely-partner.repository";
import { PartnerNotFoundError } from "../../../src/domain/error";
import { partnerFixtures } from "../../fixtures";
import { createMockLogger } from "../../mocks/logger.mock";

function createMockKysely(result?: Record<string, unknown>) {
	const data = result ?? partnerFixtures.valid();

	const executeTakeFirstOrThrow = () => Promise.resolve(data);
	const selectAll = () => ({ executeTakeFirstOrThrow });
	const where = () => ({ selectAll });
	const selectFrom = () => ({ where, selectAll });

	return { selectFrom };
}

function createMockKyselyNoResult() {
	const error = new NoResultError({ kind: "NoResultError" } as never);

	const executeTakeFirstOrThrow = () => Promise.reject(error);
	const selectAll = () => ({ executeTakeFirstOrThrow });
	const where = () => ({ selectAll });
	const selectFrom = () => ({ where, selectAll });

	return { selectFrom };
}

function createMockKyselyUnexpectedError() {
	const error = new Error("database connection lost");

	const executeTakeFirstOrThrow = () => Promise.reject(error);
	const selectAll = () => ({ executeTakeFirstOrThrow });
	const where = () => ({ selectAll });
	const selectFrom = () => ({ where, selectAll });

	return { selectFrom };
}

describe("KyselyPartnerRepository", () => {
	let repository: KyselyPartnerRepository;
	let mockLogger: ReturnType<typeof createMockLogger>;

	beforeEach(() => {
		mockLogger = createMockLogger();
	});

	describe("findByName", () => {
		test("should return Partner entity when partner exists in database", async () => {
			const mockKysely = createMockKysely();
			repository = new KyselyPartnerRepository({
				kysely: mockKysely as unknown as never,
				logger: mockLogger,
			});

			const partner = await repository.findByName("partner-abc");

			expect(partner.name).toBe("partner-abc");
			expect(partner.partnerId).toBe(1);
			expect(partner.token).toBe("secret-token-123");
		});

		test("should throw PartnerNotFoundError when partner does not exist", async () => {
			const mockKysely = createMockKyselyNoResult();
			repository = new KyselyPartnerRepository({
				kysely: mockKysely as unknown as never,
				logger: mockLogger,
			});

			await expect(repository.findByName("nonexistent")).rejects.toThrow(PartnerNotFoundError);
			await expect(repository.findByName("nonexistent")).rejects.toThrow('partner with name "nonexistent" not found');
		});

		test("should re-throw unexpected database errors unchanged", async () => {
			const mockKysely = createMockKyselyUnexpectedError();
			repository = new KyselyPartnerRepository({
				kysely: mockKysely as unknown as never,
				logger: mockLogger,
			});

			await expect(repository.findByName("partner-abc")).rejects.toThrow("database connection lost");
		});

		test("should log debug on initialization", () => {
			const mockKysely = createMockKysely();
			repository = new KyselyPartnerRepository({
				kysely: mockKysely as unknown as never,
				logger: mockLogger,
			});

			expect(mockLogger.hasLog("debug", "KyselyPartnerRepository initialized")).toBe(true);
		});

		test("should log warn when partner is not found", async () => {
			const mockKysely = createMockKyselyNoResult();
			repository = new KyselyPartnerRepository({
				kysely: mockKysely as unknown as never,
				logger: mockLogger,
			});

			await expect(repository.findByName("nonexistent")).rejects.toThrow();

			expect(mockLogger.hasLog("warn", "Partner not found")).toBe(true);
		});

		test("should log debug when partner is found", async () => {
			const mockKysely = createMockKysely();
			repository = new KyselyPartnerRepository({
				kysely: mockKysely as unknown as never,
				logger: mockLogger,
			});

			await repository.findByName("partner-abc");

			expect(mockLogger.hasLog("debug", "Partner found")).toBe(true);
		});

		test("should log error when database query fails unexpectedly", async () => {
			const mockKysely = createMockKyselyUnexpectedError();
			repository = new KyselyPartnerRepository({
				kysely: mockKysely as unknown as never,
				logger: mockLogger,
			});

			await expect(repository.findByName("partner-abc")).rejects.toThrow();

			expect(mockLogger.hasLog("error", "Failed to find partner")).toBe(true);
		});
	});
});
