import z from "zod";
import { LogLevel } from "../enum";

export const EnvSchema = z.object({
	// Node Environment
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),

	APP_NAME: z.string().default("qr-payment"),
	LOG_LEVEL: z.enum(LogLevel).default(LogLevel.INFO),

	// Application
	PORT: z
		.string()
		.transform((val) => Number(val))
		.default(4001),
	VERSION: z.string().optional().default("0.1.0"),
	VERCEL: z
		.string()
		.transform((val) => val === "1")
		.default(false),
	DATABASE_URL: z.url(),
});
