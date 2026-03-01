import z from "zod";

export const CustomerSchema = z.object({
	customerId: z.number(),
	email: z.email(),
	createdAt: z.date().default(new Date()),
	updatedAt: z.date().default(new Date()),
});

export const CustomerSelectDtoSchema = CustomerSchema.partial();
export const CustomerCreateDtoSchema = CustomerSchema.pick({
	email: true,
});
