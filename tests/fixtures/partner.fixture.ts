import type { PartnerSelectDto } from "../../src/domain/type";

export const partnerFixtures = {
	valid: (): PartnerSelectDto => ({
		partnerId: 1,
		name: "partner-abc",
		token: "secret-token-123",
	}),

	minimal: (): PartnerSelectDto => ({
		name: "minimal-partner",
	}),
};
