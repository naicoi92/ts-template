import z from "zod";
import { InvoiceStatus } from "../enum";

export const InvoiceSchema = z.object({
	invoiceId: z.number(),
	code: z.string().default(Date.now().toString(36)),
	customerId: z.number(),
	email: z.email(),
	orderId: z.string().min(1, "Order ID is required"),
	amount: z.number().refine((val) => val > 0),
	status: z.enum(InvoiceStatus).default(InvoiceStatus.PENDING),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const InvoiceSelectDtoSchema = InvoiceSchema.partial();

export const InvoiceCreateDtoSchema = InvoiceSchema.pick({
	code: true,
	customerId: true,
	email: true,
	orderId: true,
	amount: true,
});
export const InvoiceParamsDtoSchema = InvoiceSchema.pick({
	orderId: true,
});
