import { describe, expect, test } from "bun:test";
import { PartnerAuthenticationError } from "../../../src/domain/error/partner-authentication.error";

describe("PartnerAuthenticationError", () => {
	test("should be instance of Error", () => {
		const error = new PartnerAuthenticationError();
		expect(error).toBeInstanceOf(Error);
	});

	test("should have correct error name", () => {
		const error = new PartnerAuthenticationError();
		expect(error.name).toBe("PartnerAuthenticationError");
	});

	test("should have default generic message", () => {
		const error = new PartnerAuthenticationError();
		expect(error.message).toBe("Authentication failed");
	});

	test("should not expose internal details in message", () => {
		const error = new PartnerAuthenticationError();
		// Message should be generic, not revealing why auth failed
		expect(error.message).not.toContain("partner");
		expect(error.message).not.toContain("token");
		expect(error.message).not.toContain("signature");
		expect(error.message).not.toContain("header");
	});

	test("should be throwable and catchable", () => {
		expect(() => {
			throw new PartnerAuthenticationError();
		}).toThrow(PartnerAuthenticationError);
	});

	test("should preserve stack trace", () => {
		const error = new PartnerAuthenticationError();
		expect(error.stack).toBeDefined();
		expect(error.stack).toContain("PartnerAuthenticationError");
	});
});
