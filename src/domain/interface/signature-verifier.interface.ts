export interface SignatureVerifier {
	verify(token: string, canonical: string, signature: string): boolean;
}
