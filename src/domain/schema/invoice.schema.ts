import z from "zod";

export const InvoiceSchema = z.object({
	id: z.number(),
	email: z.email(),
	customerId: z.number(),
	orderId: z.string(),
	amount: z.number().refine((val) => val > 0),
	createdAt: z.date().default(new Date()),
	updatedAt: z.date().default(new Date()),
});

export const InvoiceSelectDtoSchema = InvoiceSchema.partial();

export const InvoiceCreateDtoSchema = z.object({
	email: z.string().email("Invalid email format"),
	orderId: z.string().min(1, "Order ID is required"),
	amount: z.number().positive("Amount must be positive"),
});
