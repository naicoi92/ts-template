import type { SignatureVerifier } from "../../src/domain/interface/signature-verifier.interface";

interface SeededSignature {
	token: string;
	canonical: string;
	signature: string;
}

export class MockSignatureVerifier implements SignatureVerifier {
	private seededSignatures: SeededSignature[] = [];
	private defaultValid = true;

	verify(token: string, canonical: string, signature: string): boolean {
		const seeded = this.seededSignatures.find(
			(s) => s.token === token && s.canonical === canonical && s.signature === signature,
		);
		if (seeded) return true;

		if (this.defaultValid) return true;

		return false;
	}

	reset(): void {
		this.seededSignatures = [];
		this.defaultValid = true;
	}

	seedSignature(token: string, canonical: string, signature: string): void {
		this.seededSignatures.push({ token, canonical, signature });
	}

	setDefaultValid(valid: boolean): void {
		this.defaultValid = valid;
	}
}

export function createMockSignatureVerifier(): MockSignatureVerifier {
	return new MockSignatureVerifier();
}
