import z from "zod";

export const PartnerSchema = z.object({
	id: z.number(),
	name: z.string().min(3),
	prefix: z.string().min(3).max(3).uppercase(),
	homepage: z.httpUrl(),
	token: z.uuidv7(),
});
