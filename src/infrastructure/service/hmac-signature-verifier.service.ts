import { createHmac, timingSafeEqual } from "node:crypto";
import type {
	SignatureVerificationInput,
	SignatureVerifier,
} from "../../domain/interface/signature-verifier.interface";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export class HmacSignatureVerifierService implements SignatureVerifier {
	verify(input: SignatureVerificationInput): boolean {
		const { token, signature, request } = input;

		if (!token || !signature || !request.method || !request.pathname) {
			return false;
		}

		if (!this.isValidHexString(signature)) {
			return false;
		}

		const canonical = this.buildCanonicalString(request.method, request.pathname, request.data);

		const expectedSignature = this.computeHmacSha256(token, canonical);

		return this.constantTimeCompare(signature, expectedSignature);
	}

	private buildCanonicalString(method: string, pathname: string, data?: unknown): string {
		const upperMethod = method.toUpperCase();

		let dataSegment = "";
		if (data !== undefined && data !== null) {
			const sorted = this.sortJsonKeys(data as JsonValue);
			dataSegment = JSON.stringify(sorted);
		}

		return `${upperMethod}\n${pathname}\n${dataSegment}`;
	}

	private sortJsonKeys(value: JsonValue): JsonValue {
		if (value === null || typeof value !== "object") {
			return value;
		}

		if (Array.isArray(value)) {
			return value.map((item) => this.sortJsonKeys(item));
		}

		const sortedEntries = Object.entries(value)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([key, nestedValue]) => [key, this.sortJsonKeys(nestedValue)]);

		return Object.fromEntries(sortedEntries);
	}

	private computeHmacSha256(token: string, canonical: string): string {
		const hmac = createHmac("sha256", token);
		hmac.update(canonical);
		return hmac.digest("hex");
	}

	private isValidHexString(value: string): boolean {
		if (value.length === 0 || value.length % 2 !== 0) {
			return false;
		}
		return /^[0-9a-f]+$/.test(value.toLowerCase());
	}

	private constantTimeCompare(a: string, b: string): boolean {
		if (a.length !== b.length) {
			return false;
		}
		const aBytes = Buffer.from(a, "hex");
		const bBytes = Buffer.from(b, "hex");
		return timingSafeEqual(aBytes, bBytes);
	}
}
