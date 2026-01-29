import type z from "zod";
import type {
	InvoiceCreateInputSchema,
	InvoiceCreateSchema,
	InvoiceSchema,
	InvoiceSelectSchema,
} from "../schema";

export type InvoiceDto = z.infer<typeof InvoiceSchema>;
export type InvoiceSelectDto = z.infer<typeof InvoiceSelectSchema>;
export type InvoiceCreateDto = z.infer<typeof InvoiceCreateSchema>;

export type InvoiceCreateInput = z.input<typeof InvoiceCreateInputSchema>;
