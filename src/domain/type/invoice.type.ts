import type z from "zod";
import type {
	InvoiceCreateInputSchema,
	InvoiceSchema,
	InvoiceSelectDtoSchema,
} from "../schema";

export type InvoiceDto = z.infer<typeof InvoiceSchema>;
export type InvoiceSelectDto = z.infer<typeof InvoiceSelectDtoSchema>;
export type InvoiceCreateInput = z.infer<typeof InvoiceCreateInputSchema>;
