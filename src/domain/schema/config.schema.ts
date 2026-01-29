import z from "zod";
import { LogLevel } from "../enum";

export const DatabaseConfigSchema = z.object({
	url: z.url(),
});

export const LogLevelConfigSchema = z.enum(LogLevel).default(LogLevel.INFO);

export const ConfigSchema = z.object({
	name: z.string().default("qr-payment"),
	database: DatabaseConfigSchema,
	logLevel: LogLevelConfigSchema,
});
