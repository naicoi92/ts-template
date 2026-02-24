import type z from "zod";
import type {
	InvoiceCreateInputSchema,
	InvoiceSchema,
	InvoiceSelectSchema,
} from "../schema";

export type InvoiceDto = z.infer<typeof InvoiceSchema>;
export type InvoiceSelectDto = z.infer<typeof InvoiceSelectSchema>;
export type InvoiceCreateDto = z.infer<typeof InvoiceSchema>;
export type InvoiceCreateInput = z.input<typeof InvoiceCreateInputSchema>;
