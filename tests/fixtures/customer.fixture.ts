import type { CustomerSelectDto } from "../../src/domain/type";

export const customerFixtures = {
	complete: (): CustomerSelectDto => ({
		customerId: 1,
		email: "customer@example.com",
		createdAt: new Date("2024-01-10T08:00:00Z"),
		updatedAt: new Date("2024-01-10T08:00:00Z"),
	}),

	minimal: (): CustomerSelectDto => ({
		email: "minimal@example.com",
	}),
};

export const customerCreateFixtures = {
	valid: () => ({ email: "new-customer@example.com" }),
};
