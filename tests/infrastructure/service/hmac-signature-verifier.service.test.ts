import { beforeEach, describe, expect, test } from "bun:test";
import { HmacSignatureVerifierService } from "../../../src/infrastructure/service/hmac-signature-verifier.service";
import type { SignatureVerifier } from "../../../src/domain/interface/signature-verifier.interface";

describe("HmacSignatureVerifierService", () => {
	let verifier: SignatureVerifier;

	beforeEach(() => {
		verifier = new HmacSignatureVerifierService();
	});

	describe("verify", () => {
		describe("valid signatures", () => {
			test("should return true for valid HMAC-SHA256 signature", () => {
				const token = "test-secret-key";
				const canonical = "POST\n/invoices\n{\"amount\":100}";
				const signature = "4d2c2a5649327a5f059c545d5d7e9fd95694cac688ed41b54282f1304d8abd39";

				const result = verifier.verify(token, canonical, signature);
				expect(result).toBe(true);
			});

			test("should return true for known HMAC-SHA256 value", () => {
				// Known test vector: HMAC-SHA256("key", "The quick brown fox jumps over the lazy dog")
				// = 0xf7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8
				const token = "key";
				const canonical = "The quick brown fox jumps over the lazy dog";
				const expectedSignature = "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8";

				const result = verifier.verify(token, canonical, expectedSignature);
				expect(result).toBe(true);
			});
		});

		describe("invalid signatures", () => {
			test("should return false for invalid signature", () => {
				const token = "test-secret-key";
				const canonical = "POST\n/invoices\n{\"amount\":100}";
				const invalidSignature = "0000000000000000000000000000000000000000000000000000000000000000";

				const result = verifier.verify(token, canonical, invalidSignature);
				expect(result).toBe(false);
			});

			test("should return false for wrong signature", () => {
				const token = "test-secret-key";
				const canonical = "POST\n/invoices\n{\"amount\":100}";
				const wrongSignature = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

				const result = verifier.verify(token, canonical, wrongSignature);
				expect(result).toBe(false);
			});

			test("should return false for signature with wrong length", () => {
				const token = "test-secret-key";
				const canonical = "POST\n/invoices\n{\"amount\":100}";
				const shortSignature = "abcd";

				const result = verifier.verify(token, canonical, shortSignature);
				expect(result).toBe(false);
			});

			test("should return false for non-hex characters", () => {
				const token = "test-secret-key";
				const canonical = "POST\n/invoices\n{\"amount\":100}";
				const nonHexSignature = "gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg";

				const result = verifier.verify(token, canonical, nonHexSignature);
				expect(result).toBe(false);
			});
		});

		describe("empty and malformed input", () => {
			test("should return false for empty signature", () => {
				const token = "test-secret-key";
				const canonical = "POST\n/invoices\n{\"amount\":100}";

				const result = verifier.verify(token, canonical, "");
				expect(result).toBe(false);
			});

			test("should return false for empty token", () => {
				const token = "";
				const canonical = "POST\n/invoices\n{\"amount\":100}";
				const signature = "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8";

				const result = verifier.verify(token, canonical, signature);
				expect(result).toBe(false);
			});

			test("should return false for empty canonical", () => {
				const token = "test-secret-key";
				const canonical = "";
				const signature = "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8";

				const result = verifier.verify(token, canonical, signature);
				expect(result).toBe(false);
			});

			test("should return false for signature with odd length (invalid hex)", () => {
				const token = "test-secret-key";
				const canonical = "POST\n/invoices\n{\"amount\":100}";
				const oddLengthSignature = "f7bc83f430538424b13298e6aa6fb143"; // 31 chars, odd

				const result = verifier.verify(token, canonical, oddLengthSignature);
				expect(result).toBe(false);
			});
		});

		describe("timing-safe comparison", () => {
			test("should use constant-time comparison to prevent timing attacks", () => {
				const token = "test-secret-key";
				const canonical = "POST\n/invoices\n{\"amount\":100}";
				const validSignature = "4d2c2a5649327a5f059c545d5d7e9fd95694cac688ed41b54282f1304d8abd39";

				const result = verifier.verify(token, canonical, validSignature);
				expect(result).toBe(true);
			});
		});
	});
});
