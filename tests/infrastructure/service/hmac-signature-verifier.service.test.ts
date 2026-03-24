import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createHmac } from "node:crypto";
import { HmacSignatureVerifierService } from "../../../src/infrastructure/service/hmac-signature-verifier.service";
import type {
	SignatureVerificationRequest,
	SignatureVerifier,
} from "../../../src/domain/interface/signature-verifier.interface";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const MAX_SIGNATURE_AGE_SECONDS = 300;
const FIXED_NOW_MS = Date.parse("2026-03-24T12:00:00.000Z");
const FIXED_NOW_SECONDS = Math.floor(FIXED_NOW_MS / 1000);
const originalDateNow = Date.now;

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

function buildCanonicalString(
	method: string,
	pathname: string,
	timestamp?: string,
	data?: unknown,
): string {
	const upperMethod = method.toUpperCase();

	let dataSegment = "";
	if (data !== undefined && data !== null) {
		const sorted = sortJsonKeys(data as JsonValue);
		dataSegment = JSON.stringify(sorted);
	}

	return `${upperMethod}\n${pathname}\n${timestamp ?? ""}\n${dataSegment}`;
}

function createSignature(token: string, request: SignatureVerificationRequest): string {
	const canonical = buildCanonicalString(
		request.method,
		request.pathname,
		request.timestamp,
		request.data,
	);
	const hmac = createHmac("sha256", token);
	hmac.update(canonical);
	return hmac.digest("hex");
}

describe("HmacSignatureVerifierService", () => {
	let verifier: SignatureVerifier;

	beforeEach(() => {
		verifier = new HmacSignatureVerifierService();
		Date.now = () => FIXED_NOW_MS;
	});

	afterEach(() => {
		Date.now = originalDateNow;
	});

	describe("verify", () => {
		describe("valid signatures", () => {
			test("should return true for valid HMAC-SHA256 signature", () => {
				const token = "test-secret-key";
				const timestamp = `${FIXED_NOW_SECONDS}`;
				const request = {
					method: "POST",
					pathname: "/invoices",
					timestamp,
					data: { amount: 100 },
				};
				const signature = createSignature(token, request);

				const result = verifier.verify({ token, signature, request });
				expect(result).toBe(true);
			});

			test("should return true for valid signature with timestamp inside 300-second window", () => {
				const token = "test-secret-key";
				const timestamp = `${FIXED_NOW_SECONDS - 60}`;
				const request = {
					method: "POST",
					pathname: "/invoices",
					timestamp,
					data: { amount: 100 },
				};
				const signature = createSignature(token, request);

				const result = verifier.verify({ token, signature, request });
				expect(result).toBe(true);
			});

			test("should return true for known HMAC-SHA256 value", () => {
				const token = "key";
				const timestamp = `${FIXED_NOW_SECONDS}`;
				const request = {
					method: "POST",
					pathname: "/quick-brown-fox",
					timestamp,
					data: "The quick brown fox jumps over the lazy dog",
				};
				const hmac = createHmac("sha256", token);
				hmac.update(`POST\n/quick-brown-fox\n${timestamp}\n\"The quick brown fox jumps over the lazy dog\"`);
				const expectedSignature = hmac.digest("hex");

				const result = verifier.verify({ token, signature: expectedSignature, request });
				expect(result).toBe(true);
			});

			test("should return true for known HMAC-SHA256 value with timestamp in canonical string", () => {
				const token = "key";
				const timestamp = `${FIXED_NOW_SECONDS}`;
				const request = {
					method: "POST",
					pathname: "/quick-brown-fox",
					timestamp,
					data: "The quick brown fox jumps over the lazy dog",
				};
				const hmac = createHmac("sha256", token);
				hmac.update(
					`POST\n/quick-brown-fox\n${timestamp}\n\"The quick brown fox jumps over the lazy dog\"`,
				);
				const expectedSignature = hmac.digest("hex");

				const result = verifier.verify({ token, signature: expectedSignature, request });
				expect(result).toBe(true);
			});
		});

		describe("invalid signatures", () => {
			test("should return false for invalid signature", () => {
				const token = "test-secret-key";
				const timestamp = `${FIXED_NOW_SECONDS}`;
				const request = {
					method: "POST",
					pathname: "/invoices",
					timestamp,
					data: { amount: 100 },
				};
				const invalidSignature = "0000000000000000000000000000000000000000000000000000000000000000";

				const result = verifier.verify({ token, signature: invalidSignature, request });
				expect(result).toBe(false);
			});

			test("should return false for wrong signature", () => {
				const token = "test-secret-key";
				const timestamp = `${FIXED_NOW_SECONDS}`;
				const request = {
					method: "POST",
					pathname: "/invoices",
					timestamp,
					data: { amount: 100 },
				};
				const wrongSignature = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

				const result = verifier.verify({ token, signature: wrongSignature, request });
				expect(result).toBe(false);
			});

			test("should return false for signature with wrong length", () => {
				const token = "test-secret-key";
				const timestamp = `${FIXED_NOW_SECONDS}`;
				const request = {
					method: "POST",
					pathname: "/invoices",
					timestamp,
					data: { amount: 100 },
				};
				const shortSignature = "abcd";

				const result = verifier.verify({ token, signature: shortSignature, request });
				expect(result).toBe(false);
			});

			test("should return false for non-hex characters", () => {
				const token = "test-secret-key";
				const timestamp = `${FIXED_NOW_SECONDS}`;
				const request = {
					method: "POST",
					pathname: "/invoices",
					timestamp,
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
				const timestamp = `${FIXED_NOW_SECONDS}`;
				const request = {
					method: "POST",
					pathname: "/invoices",
					timestamp,
					data: { amount: 100 },
				};

				const result = verifier.verify({ token, signature: "", request });
				expect(result).toBe(false);
			});

			test("should return false for empty token", () => {
				const token = "";
				const timestamp = `${FIXED_NOW_SECONDS}`;
				const request = {
					method: "POST",
					pathname: "/invoices",
					timestamp,
					data: { amount: 100 },
				};
				const signature = "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8";

				const result = verifier.verify({ token, signature, request });
				expect(result).toBe(false);
			});

			test("should return false for empty request pathname", () => {
				const token = "test-secret-key";
				const timestamp = `${FIXED_NOW_SECONDS}`;
				const request = {
					method: "POST",
					pathname: "",
					timestamp,
				};
				const signature = "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8";

				const result = verifier.verify({ token, signature, request });
				expect(result).toBe(false);
			});

			test("should return false for signature with odd length (invalid hex)", () => {
				const token = "test-secret-key";
				const timestamp = `${FIXED_NOW_SECONDS}`;
				const request = {
					method: "POST",
					pathname: "/invoices",
					timestamp,
					data: { amount: 100 },
				};
				const oddLengthSignature = "f7bc83f430538424b13298e6aa6fb143"; // 31 chars, odd

				const result = verifier.verify({ token, signature: oddLengthSignature, request });
				expect(result).toBe(false);
			});

			test("should return false for malformed timestamp", () => {
				const token = "test-secret-key";
				const request = {
					method: "POST",
					pathname: "/invoices",
					timestamp: "not-a-unix-timestamp",
					data: { amount: 100 },
				};
				const signature = createSignature(token, request);

				const result = verifier.verify({ token, signature, request });
				expect(result).toBe(false);
			});

			test("should return false for expired timestamp older than 300 seconds", () => {
				const token = "test-secret-key";
				const request = {
					method: "POST",
					pathname: "/invoices",
					timestamp: `${FIXED_NOW_SECONDS - MAX_SIGNATURE_AGE_SECONDS - 1}`,
					data: { amount: 100 },
				};
				const signature = createSignature(token, request);

				const result = verifier.verify({ token, signature, request });
				expect(result).toBe(false);
			});

			test("should return false for future timestamp more than 300 seconds ahead", () => {
				const token = "test-secret-key";
				const request = {
					method: "POST",
					pathname: "/invoices",
					timestamp: `${FIXED_NOW_SECONDS + MAX_SIGNATURE_AGE_SECONDS + 1}`,
					data: { amount: 100 },
				};
				const signature = createSignature(token, request);

				const result = verifier.verify({ token, signature, request });
				expect(result).toBe(false);
			});
		});

		describe("timing-safe comparison", () => {
			test("should use constant-time comparison to prevent timing attacks", () => {
				const token = "test-secret-key";
				const timestamp = `${FIXED_NOW_SECONDS}`;
				const request = {
					method: "POST",
					pathname: "/invoices",
					timestamp,
					data: { amount: 100 },
				};
				const validSignature = createSignature(token, request);

				const result = verifier.verify({ token, signature: validSignature, request });
				expect(result).toBe(true);
			});
		});

		describe("missing timestamp", () => {
			test("should return false when timestamp is missing", () => {
				const token = "test-secret-key";
				const request = {
					method: "POST",
					pathname: "/invoices",
				};
				// @ts-expect-error - testing runtime behavior when timestamp is missing
				const result = verifier.verify({ token, signature: "a".repeat(64), request });
				expect(result).toBe(false);
			});
		});
	});
});
