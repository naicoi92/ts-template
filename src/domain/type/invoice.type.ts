import type z from "zod";
import type {
	InvoiceCreateDtoSchema,
	InvoiceSchema,
	InvoiceSelectDtoSchema,
} from "../schema";

export type InvoiceDto = z.infer<typeof InvoiceSchema>;
export type InvoiceSelectDto = z.infer<typeof InvoiceSelectDtoSchema>;
export type InvoiceCreateDto = z.infer<typeof InvoiceCreateDtoSchema>;
