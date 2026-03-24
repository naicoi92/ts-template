import z from "zod";

export const PartnerSchema = z.object({
	partnerId: z.number(),
	name: z.string().min(3),
	token: z.string(),
});

export const PartnerSelectDtoSchema = PartnerSchema.partial();
