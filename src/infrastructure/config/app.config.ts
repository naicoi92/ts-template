import { injectable } from "tsyringe";
import { z } from "zod";
import { InvalidConfigError } from "@/domain/errors/config.error";
import type { IConfig } from "@/domain/interfaces/config.interface";

// Schema validation cho environment variables
const envSchema = z.object({
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
		.default("3000")
		.transform((val) => Number(val)),
	VERSION: z.string().optional().default("1.0.0"),

	// App Base URL
	APP_BASE_URL: z.url().default("http://localhost:3000"),
});

@injectable()
export class AppConfig implements IConfig {
	private readonly env: z.infer<typeof envSchema>;

	constructor() {
		try {
			this.env = envSchema.parse(process.env);
		} catch (error) {
			if (error instanceof z.ZodError) {
				const errorMessages = error.issues.map(
					(issue) => `${issue.path.join(".")}: ${issue.message}`,
				);
				throw new InvalidConfigError(
					"environment variables",
					errorMessages.join(", "),
					{ originalError: error },
				);
			}
			throw new InvalidConfigError(
				"environment variables",
				"Unknown validation error",
				{ originalError: error },
			);
		}
	}

	// Application
	get nodeEnv(): string {
		return this.env.NODE_ENV;
	}

	get port(): number {
		return this.env.PORT;
	}

	get version(): string {
		return this.env.VERSION;
	}

	get logLevel(): string {
		return this.env.LOG_LEVEL;
	}

	// App configuration
	get app() {
		return {
			name: this.env.APP_NAME,
			baseUrl: this.env.APP_BASE_URL,
		};
	}

	// Helper methods
	get isDevelopment(): boolean {
		return this.env.NODE_ENV === "development";
	}

	get isProduction(): boolean {
		return this.env.NODE_ENV === "production";
	}

	get isTest(): boolean {
		return this.env.NODE_ENV === "test";
	}

	get isVercel(): boolean {
		return process.env.VERCEL === "1";
	}
}
