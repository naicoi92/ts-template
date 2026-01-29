import z from "zod";

export const CustomerSchema = z.object({
	id: z.number(),
	email: z.string().lowercase(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const CustomerSelectSchema = CustomerSchema.partial();
export const CustomerCreateSchema = CustomerSchema.pick({
	email: true,
});
