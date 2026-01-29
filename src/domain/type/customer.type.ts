import type z from "zod";
import type {
	CustomerCreateSchema,
	CustomerSchema,
	CustomerSelectSchema,
} from "../schema";

export type CustomerDto = z.infer<typeof CustomerSchema>;
export type CustomerSelectDto = z.infer<typeof CustomerSelectSchema>;
export type CustomerCreateDto = z.infer<typeof CustomerCreateSchema>;
