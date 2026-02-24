import z from "zod";

export const CustomerSchema = z.object({
	id: z.number(),
	email: z.string().email(),
	createdAt: z.date().default(new Date()),
	updatedAt: z.date().default(new Date()),
});

export const CustomerSelectSchema = CustomerSchema.partial();
export const CustomerCreateSchema = z.object({
	id: z.number(),
	email: z.string().email(),
});
