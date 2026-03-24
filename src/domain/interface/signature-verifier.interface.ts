export type SignatureVerificationRequest = {
	method: string;
	pathname: string;
	timestamp: string;
	data?: unknown;
};

export type SignatureVerificationInput = {
	token: string;
	signature: string;
	request: SignatureVerificationRequest;
};

export interface SignatureVerifier {
	verify(input: SignatureVerificationInput): boolean;
}
