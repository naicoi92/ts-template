import z from "zod";
import { LogLevel } from "../enum";
import type { PartnerCredential } from "../type";

export const EnvSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

	APP_NAME: z.string().default("qr-payment"),
	LOG_LEVEL: z.enum(LogLevel).default(LogLevel.INFO),
	 PORT: z.coerce.number().default(4001),

	VERSION: z.string().optional().default("0.1.0"),
	VERCEL: z
		.string()
		.transform((val) => val === "1")
		.default(false),
	DATABASE_URL: z.string(),

	PARTNER_CREDENTIALS: z
		.string()
		.transform((val) => JSON.parse(val) as PartnerCredential[])
		.default(() => [] as PartnerCredential[]),
});
