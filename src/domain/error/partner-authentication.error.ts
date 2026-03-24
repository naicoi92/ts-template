export class PartnerAuthenticationError extends Error {
	constructor() {
		super("Authentication failed");
		this.name = "PartnerAuthenticationError";
	}
}
