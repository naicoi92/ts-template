import type z from "zod";
import type {
	CreateInvoiceResponseSchema,
	GetInvoiceResponseSchema,
	InvoiceCreateDtoSchema,
	InvoiceParamsDtoSchema,
	InvoiceSchema,
	InvoiceSelectDtoSchema,
} from "../schema";

export type InvoiceDto = z.infer<typeof InvoiceSchema>;
export type InvoiceSelectDto = z.infer<typeof InvoiceSelectDtoSchema>;
export type InvoiceCreateDto = z.infer<typeof InvoiceCreateDtoSchema>;
export type InvoiceParamsDto = z.infer<typeof InvoiceParamsDtoSchema>;
export type GetInvoiceResponse = z.infer<typeof GetInvoiceResponseSchema>;
export type CreateInvoiceResponse = z.infer<typeof CreateInvoiceResponseSchema>;
