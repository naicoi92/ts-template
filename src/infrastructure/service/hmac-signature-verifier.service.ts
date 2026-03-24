import { createHmac, timingSafeEqual } from "node:crypto";
import type { SignatureVerifier } from "../../domain/interface/signature-verifier.interface";

export class HmacSignatureVerifierService implements SignatureVerifier {
	verify(token: string, canonical: string, signature: string): boolean {
		if (!token || !canonical || !signature) {
			return false;
		}

		if (!this.isValidHexString(signature)) {
			return false;
		}

		const expectedSignature = this.computeHmacSha256(token, canonical);

		return this.constantTimeCompare(signature, expectedSignature);
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
