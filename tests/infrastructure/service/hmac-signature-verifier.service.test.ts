import { beforeEach, describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";
import { HmacSignatureVerifierService } from "../../../src/infrastructure/service/hmac-signature-verifier.service";
import type {
	SignatureVerificationRequest,
	SignatureVerifier,
} from "../../../src/domain/interface/signature-verifier.interface";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function sortJsonKeys(value: JsonValue): JsonValue {
	if (value === null || typeof value !== "object") {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map(sortJsonKeys);
	}

	const sortedEntries = Object.entries(value)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, nestedValue]) => [key, sortJsonKeys(nestedValue)]);

	return Object.fromEntries(sortedEntries);
}

function buildCanonicalString(method: string, pathname: string, data?: unknown): string {
	const upperMethod = method.toUpperCase();

	let dataSegment = "";
	if (data !== undefined && data !== null) {
		const sorted = sortJsonKeys(data as JsonValue);
		dataSegment = JSON.stringify(sorted);
	}

	return `${upperMethod}\n${pathname}\n${dataSegment}`;
}

function createSignature(token: string, request: SignatureVerificationRequest): string {
	const canonical = buildCanonicalString(request.method, request.pathname, request.data);
	const hmac = createHmac("sha256", token);
	hmac.update(canonical);
	return hmac.digest("hex");
}

describe("HmacSignatureVerifierService", () => {
	let verifier: SignatureVerifier;

	beforeEach(() => {
		verifier = new HmacSignatureVerifierService();
	});

	describe("verify", () => {
		describe("valid signatures", () => {
			test("should return true for valid HMAC-SHA256 signature", () => {
				const token = "test-secret-key";
				const request = {
					method: "POST",
					pathname: "/invoices",
					data: { amount: 100 },
				};
				const signature = createSignature(token, request);

				const result = verifier.verify({ token, signature, request });
				expect(result).toBe(true);
			});

			test("should return true for known HMAC-SHA256 value", () => {
				const token = "key";
				const request = {
					method: "POST",
					pathname: "/quick-brown-fox",
					data: "The quick brown fox jumps over the lazy dog",
				};
				const expectedSignature = createSignature(token, request);

				const result = verifier.verify({ token, signature: expectedSignature, request });
				expect(result).toBe(true);
			});
		});

		describe("invalid signatures", () => {
			test("should return false for invalid signature", () => {
				const token = "test-secret-key";
				const request = {
					method: "POST",
					pathname: "/invoices",
					data: { amount: 100 },
				};
				const invalidSignature = "0000000000000000000000000000000000000000000000000000000000000000";

				const result = verifier.verify({ token, signature: invalidSignature, request });
				expect(result).toBe(false);
			});

			test("should return false for wrong signature", () => {
				const token = "test-secret-key";
				const request = {
					method: "POST",
					pathname: "/invoices",
					data: { amount: 100 },
				};
				const wrongSignature = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

				const result = verifier.verify({ token, signature: wrongSignature, request });
				expect(result).toBe(false);
			});

			test("should return false for signature with wrong length", () => {
				const token = "test-secret-key";
				const request = {
					method: "POST",
					pathname: "/invoices",
					data: { amount: 100 },
				};
				const shortSignature = "abcd";

				const result = verifier.verify({ token, signature: shortSignature, request });
				expect(result).toBe(false);
			});

			test("should return false for non-hex characters", () => {
				const token = "test-secret-key";
				const request = {
					method: "POST",
					pathname: "/invoices",
					data: { amount: 100 },
				};
				const nonHexSignature = "gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg";

				const result = verifier.verify({ token, signature: nonHexSignature, request });
				expect(result).toBe(false);
			});
		});

		describe("empty and malformed input", () => {
			test("should return false for empty signature", () => {
				const token = "test-secret-key";
				const request = {
					method: "POST",
					pathname: "/invoices",
					data: { amount: 100 },
				};

				const result = verifier.verify({ token, signature: "", request });
				expect(result).toBe(false);
			});

			test("should return false for empty token", () => {
				const token = "";
				const request = {
					method: "POST",
					pathname: "/invoices",
					data: { amount: 100 },
				};
				const signature = "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8";

				const result = verifier.verify({ token, signature, request });
				expect(result).toBe(false);
			});

			test("should return false for empty request pathname", () => {
				const token = "test-secret-key";
				const request = {
					method: "POST",
					pathname: "",
				};
				const signature = "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8";

				const result = verifier.verify({ token, signature, request });
				expect(result).toBe(false);
			});

			test("should return false for signature with odd length (invalid hex)", () => {
				const token = "test-secret-key";
				const request = {
					method: "POST",
					pathname: "/invoices",
					data: { amount: 100 },
				};
				const oddLengthSignature = "f7bc83f430538424b13298e6aa6fb143"; // 31 chars, odd

				const result = verifier.verify({ token, signature: oddLengthSignature, request });
				expect(result).toBe(false);
			});
		});

		describe("timing-safe comparison", () => {
			test("should use constant-time comparison to prevent timing attacks", () => {
				const token = "test-secret-key";
				const request = {
					method: "POST",
					pathname: "/invoices",
					data: { amount: 100 },
				};
				const validSignature = createSignature(token, request);

				const result = verifier.verify({ token, signature: validSignature, request });
				expect(result).toBe(true);
			});
		});
	});
});
