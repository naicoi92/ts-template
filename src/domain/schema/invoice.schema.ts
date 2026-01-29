import z from "zod";

export const InvoiceSchema = z.object({
	id: z.number(),
	customerId: z.number(),
	orderId: z.string(),
	amount: z.number().refine((val) => val > 0),
	createdAt: z.date().default(new Date()),
	updatedAt: z.date().default(new Date()),
});

export const InvoiceSelectSchema = InvoiceSchema.partial();
export const InvoiceCreateSchema = InvoiceSchema.pick({
	orderId: true,
	customerId: true,
	amount: true,
});

export const InvoiceCreateInputSchema = z.object({
	email: z.email(),
	orderId: z.string().min(1),
	amount: z.number().refine((val) => val >= 1000),
});
