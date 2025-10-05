export interface ILogger {
	trace(message: string): void;
	debug(message: string): void;
	info(message: string): void;
	warn(message: string): void;
	error(message: string): void;
	fatal(message: string): void;
	withData(metadata: Record<string, unknown>): ILogger;
	withError(error: Error): ILogger;
}

/**
 * Log levels enum
 */
export enum LogLevel {
	TRACE = "trace",
	FATAL = "fatal",
	DEBUG = "debug",
	INFO = "info",
	WARN = "warn",
	ERROR = "error",
}
