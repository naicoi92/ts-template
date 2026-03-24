import type {
	SignatureVerificationInput,
	SignatureVerificationRequest,
	SignatureVerifier,
} from "../../src/domain/interface/signature-verifier.interface";

interface SeededSignature {
	token: string;
	signature: string;
	request: SignatureVerificationRequest;
}

export class MockSignatureVerifier implements SignatureVerifier {
	private seededSignatures: SeededSignature[] = [];
	private defaultValid = true;

	verify(input: SignatureVerificationInput): boolean {
		const { token, signature, request } = input;

		const seeded = this.seededSignatures.find(
			(s) =>
				s.token === token &&
				s.signature === signature &&
				s.request.method === request.method &&
				s.request.pathname === request.pathname &&
				s.request.timestamp === request.timestamp &&
				this.toComparableData(s.request.data) === this.toComparableData(request.data),
		);
		if (seeded) return true;

		if (this.defaultValid) return true;

		return false;
	}

	private toComparableData(data: unknown): string {
		if (data === undefined) {
			return "__undefined__";
		}

		return JSON.stringify(data);
	}

	reset(): void {
		this.seededSignatures = [];
		this.defaultValid = true;
	}

	seedSignature(input: SignatureVerificationInput): void {
		if (input.token) {
			this.seededSignatures.push({
				token: input.token,
				signature: input.signature,
				request: input.request,
			});
		}
	}

	setDefaultValid(valid: boolean): void {
		this.defaultValid = valid;
	}
}

export function createMockSignatureVerifier(): MockSignatureVerifier {
	return new MockSignatureVerifier();
}
