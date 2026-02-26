import type {
	Config,
	DatabaseConfig,
	LogConfig,
	ServerConfig,
} from "../../domain/interface";
import { EnvSchema } from "../../domain/schema";
import type { EnvConfigDto } from "../../domain/type";

export class AppConfig implements Config {
	#envConfig: EnvConfigDto;
	constructor() {
		this.#envConfig = EnvSchema.parse(process.env);
	}
	get name(): string {
		return this.#envConfig.APP_NAME;
	}
	get server(): ServerConfig {
		return {
			port: this.#envConfig.PORT,
		};
	}
	get database(): DatabaseConfig {
		return {
			url: this.#envConfig.DATABASE_URL,
		};
	}
	get log(): LogConfig {
		return {
			level: this.#envConfig.LOG_LEVEL,
			onlyConsole: this.#envConfig.VERCEL,
		};
	}
}
