import z from "zod";

export const InvoiceSchema = z.object({
	id: z.number(),
	email: z.string().email(),
	customerId: z.number(),
	orderId: z.string(),
	amount: z.number().refine((val) => val > 0),
	createdAt: z.date().default(new Date()),
	updatedAt: z.date().default(new Date()),
});

export const InvoiceSelectSchema = InvoiceSchema;
export const InvoiceCreateInputSchema = z.object({
	email: z.string().email(),
	orderId: z.string(),
	amount: z.number().refine((val) => val >= 1000),
});

export const InvoiceCreateInternalDto = z.object({
	id: z.number(),
	email: z.string().email(),
	customerId: z.number(),
	orderId: z.string(),
	amount: z.number().refine((val) => val > 0),
});
