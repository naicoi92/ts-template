import type z from "zod";
import type {
	CreateInvoiceInputDtoSchema,
	CreateInvoiceOutputDtoSchema,
	GetInvoiceOutputDtoSchema,
	InvoiceCreateDtoSchema,
	InvoiceParamsDtoSchema,
	InvoiceSchema,
	InvoiceSelectDtoSchema,
} from "../schema";

export type InvoiceDto = z.infer<typeof InvoiceSchema>;
export type InvoiceSelectDto = z.infer<typeof InvoiceSelectDtoSchema>;
export type InvoiceCreateDto = z.infer<typeof InvoiceCreateDtoSchema>;
export type InvoiceParamsDto = z.infer<typeof InvoiceParamsDtoSchema>;
export type GetInvoiceOutputDto = z.infer<typeof GetInvoiceOutputDtoSchema>;
export type CreateInvoiceInputDto = z.infer<typeof CreateInvoiceInputDtoSchema>;
export type CreateInvoiceOutputDto = z.infer<typeof CreateInvoiceOutputDtoSchema>;
