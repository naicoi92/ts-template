import { createHmac, timingSafeEqual } from "node:crypto";
import type {
	SignatureVerificationInput,
	SignatureVerifier,
} from "../../domain/interface/signature-verifier.interface";

const MAX_SIGNATURE_AGE_SECONDS = 300;

export class HmacSignatureVerifierService implements SignatureVerifier {
	verify(input: SignatureVerificationInput): boolean {
		const { token, signature, request } = input;

		if (!token || !signature || !request.method || !request.pathname) {
			return false;
		}

		if (!this.isValidHexString(signature)) {
			return false;
		}

		if (!this.isValidTimestamp(request.timestamp)) {
			return false;
		}

		const canonical = this.buildCanonicalString(
			request.method,
			request.pathname,
			request.timestamp,
		);

		const expectedSignature = this.computeHmacSha256(token, canonical);

		return this.constantTimeCompare(signature, expectedSignature);
	}

	private buildCanonicalString(method: string, pathname: string, timestamp?: string): string {
		const upperMethod = method.toUpperCase();

		return `${upperMethod}\n${pathname}\n${timestamp ?? ""}\n`;
	}

	private isValidTimestamp(timestamp?: string): boolean {
		if (timestamp === undefined) {
			return false;
		}

		if (!/^\d+$/.test(timestamp)) {
			return false;
		}

		const timestampSeconds = Number(timestamp);
		if (!Number.isSafeInteger(timestampSeconds)) {
			return false;
		}

		const nowSeconds = Math.floor(Date.now() / 1000);
		const ageSeconds = nowSeconds - timestampSeconds;

		return Math.abs(ageSeconds) <= MAX_SIGNATURE_AGE_SECONDS;
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
