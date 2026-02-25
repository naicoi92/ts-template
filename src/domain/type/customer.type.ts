import type z from "zod";
import type {
	CustomerCreateDtoSchema,
	CustomerSchema,
	CustomerSelectDtoSchema,
} from "../schema";

export type CustomerDto = z.infer<typeof CustomerSchema>;
export type CustomerSelectDto = z.infer<typeof CustomerSelectDtoSchema>;
export type CustomerCreateDto = z.infer<typeof CustomerCreateDtoSchema>;
