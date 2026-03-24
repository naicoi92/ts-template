import type z from "zod";
import type { PartnerSelectDtoSchema } from "../schema";

export type PartnerSelectDto = z.infer<typeof PartnerSelectDtoSchema>;
