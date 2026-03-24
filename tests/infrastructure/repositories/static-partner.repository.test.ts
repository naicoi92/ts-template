import { beforeEach, describe, expect, test } from "bun:test";
import { StaticPartnerRepository } from "../../../src/infrastructure/repositories/static-partner.repository";
import type { Config } from "../../../src/domain/interface";
import type { PartnerCredential } from "../../../src/domain/type";
import { partnerFixtures } from "../../fixtures/partner.fixture";

describe("StaticPartnerRepository", () => {
	let repository: StaticPartnerRepository;
	let mockConfig: Config;

	beforeEach(() => {
		mockConfig = {
			partnerCredentials: [partnerFixtures.valid(), partnerFixtures.minimal()],
		} as Config;
		repository = new StaticPartnerRepository({ config: mockConfig });
	});

	describe("findByName", () => {
		test("should return partner credential when partner exists", async () => {
			const result = await repository.findByName("partner-abc");

			expect(result).toEqual(partnerFixtures.valid());
		});

		test("should return partner credential for different partner", async () => {
			const result = await repository.findByName("minimal-partner");

			expect(result).toEqual(partnerFixtures.minimal());
		});

		test("should return null when partner does not exist", async () => {
			const result = await repository.findByName("nonexistent-partner");

			expect(result).toBeNull();
		});
	});
});
