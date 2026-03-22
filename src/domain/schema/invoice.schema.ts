import z from "zod";
import { InvoiceStatus } from "../enum";

export const InvoiceSchema = z.object({
	invoiceId: z.number(),
	code: z.string().min(1, "Invoice code is required"),
	customerId: z.number(),
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
	orderId: true,
	amount: true,
});

export const InvoiceParamsDtoSchema = InvoiceSchema.pick({
	orderId: true,
});

export const GetInvoiceOutputDtoSchema = z.object({
	orderId: z.string(),
	invoiceId: z.number(),
	code: z.string(),
	amount: z.number(),
	status: z.enum(InvoiceStatus),
});

export const CreateInvoiceInputDtoSchema = z.object({
	email: z.email(),
	orderId: z.string(),
	amount: z.number(),
});

export const CreateInvoiceOutputDtoSchema = z.object({
	orderId: z.string(),
	amount: z.number(),
	code: z.string(),
});
