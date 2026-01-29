import type {
	Config,
	ConfigLoader,
	DatabaseConfig,
	LogConfig,
	ServerConfig,
} from "../../domain/interface";
import type { ConfigDto } from "../../domain/type";

export class AppConfig implements Config {
	private _config?: ConfigDto;
	constructor(private readonly _deps: { loader: ConfigLoader }) {}
	get name(): string {
		return this.config.name;
	}
	get server(): ServerConfig {
		return {
			port: 4001,
		};
	}
	get database(): DatabaseConfig {
		return {
			url: this.config.database.url,
		};
	}
	get log(): LogConfig {
		return {
			level: this.config.logLevel,
			get onlyConsole() {
				return process.env.VERCEL === "1";
			},
		};
	}
	private get config(): ConfigDto {
		if (!this._config) this._config = this.loader.load();
		return this._config;
	}
	private get loader(): ConfigLoader {
		return this._deps.loader;
	}
}
