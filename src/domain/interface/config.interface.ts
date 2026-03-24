import type { LogLevel } from "../enum";

export interface DatabaseConfig {
	readonly url: string;
}
export interface LogConfig {
	readonly level: LogLevel;
	readonly onlyConsole: boolean;
}
export interface ServerConfig {
	readonly port: number;
}
export interface Config {
	readonly name: string;
	readonly database: DatabaseConfig;
	readonly log: LogConfig;
	readonly server: ServerConfig;
}

export interface ConfigLoader {
	get(name: string): string;
}
