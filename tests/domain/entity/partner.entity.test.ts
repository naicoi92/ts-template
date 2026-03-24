import { describe, expect, test } from "bun:test";
import { PartnerFieldNotFoundError } from "../../../src/domain/error";
import { Partner } from "../../../src/domain/entity";
import { partnerFixtures } from "../../fixtures/index.ts";

describe("Partner Entity", () => {
	describe("constructor", () => {
		test("should create partner with complete data", () => {
			const data = partnerFixtures.valid();
			const partner = new Partner(data);

			expect(partner).toBeDefined();
		});

		test("should create partner with minimal data", () => {
			const data = partnerFixtures.minimal();
			const partner = new Partner(data);

			expect(partner).toBeDefined();
		});
	});

	describe("getters", () => {
		test("should return partnerId when present", () => {
			const data = partnerFixtures.valid();
			const partner = new Partner(data);

			expect(partner.partnerId).toBe(1);
		});

		test("should throw PartnerFieldNotFoundError when partnerId is missing", () => {
			const data = partnerFixtures.minimal();
			const partner = new Partner(data);

			expect(() => partner.partnerId).toThrow(PartnerFieldNotFoundError);
		});

		test("should return name when present", () => {
			const data = partnerFixtures.valid();
			const partner = new Partner(data);

			expect(partner.name).toBe("partner-abc");
		});

		test("should throw PartnerFieldNotFoundError when name is missing", () => {
			const partner = new Partner({});

			expect(() => partner.name).toThrow(PartnerFieldNotFoundError);
		});

		test("should return token when present", () => {
			const data = partnerFixtures.valid();
			const partner = new Partner(data);

			expect(partner.token).toBe("secret-token-123");
		});

		test("should throw PartnerFieldNotFoundError when token is missing", () => {
			const data = partnerFixtures.minimal();
			const partner = new Partner(data);

			expect(() => partner.token).toThrow(PartnerFieldNotFoundError);
		});
	});
});
