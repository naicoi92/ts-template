import z from "zod";

export const envSchema = z.object({
	// Node Environment
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),

	APP_NAME: z.string().default("ts-template"),
	LOG_LEVEL: z
		.enum(["trace", "debug", "info", "warn", "error", "fatal"])
		.default("info"),

	// Application
	PORT: z
		.string()
		.transform((val) => Number(val))
		.default(3000),
	VERSION: z.string().optional().default("1.0.0"),

	// App Base URL
	APP_BASE_URL: z.url().default("http://localhost:3000"),
});
