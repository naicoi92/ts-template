import type { PartnerCredential } from "../../src/domain/type";

export const partnerFixtures = {
	valid: (): PartnerCredential => ({
		name: "partner-abc",
		token: "secret-token-123",
	}),

	minimal: (): PartnerCredential => ({
		name: "minimal-partner",
		token: "minimal-token",
	}),
};
