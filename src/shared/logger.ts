import { PinoTransport } from "@loglayer/transport-pino";
import {
	ConsoleTransport,
	type ILogBuilder,
	LogLayer,
	type LogLayerTransport,
	LogLevel,
} from "loglayer";
import pino from "pino";
import pretty from "pino-pretty";
import { serializeError } from "serialize-error";
import { inject, injectable } from "tsyringe";
import type { IConfig } from "@/domain/interfaces/config.interface";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import { TOKENS } from "@/tokens";

@injectable()
export class LogLayerLogger implements ILogger {
	private logBuilder: ILogBuilder;
	private logLayer: LogLayer;
	private transports: LogLayerTransport[];

	constructor(@inject(TOKENS.CONFIG_SERVICE) private config: IConfig) {
		this.transports = this.setupTransports();

		this.logLayer = new LogLayer({
			errorSerializer: serializeError,
			transport: this.transports,
		});
		this.logLayer.setLevel(this.getLevel());
		this.logBuilder = this.logLayer.withMetadata();
	}

	private setupTransports(): LogLayerTransport[] {
		if (this.config.isVercel) {
			return [this.createConsoleTransport()];
		}

		return [this.createPinoTransport()];
	}

	private createPinoTransport(): LogLayerTransport {
		return new PinoTransport({
			logger: pino(
				pretty({
					singleLine: true,
					colorize: true,
				}),
			),
			level: this.getLevel(),
		});
	}

	private createConsoleTransport(): LogLayerTransport {
		return new ConsoleTransport({
			logger: console,
			appendObjectData: false,
			level: this.getLevel(),
		});
	}

	getLevel(): LogLevel {
		const logLevelMap: Record<string, LogLevel> = {
			trace: LogLevel.trace,
			debug: LogLevel.debug,
			info: LogLevel.info,
			warn: LogLevel.warn,
			error: LogLevel.error,
			fatal: LogLevel.fatal,
		};

		const level = logLevelMap[this.config.logLevel] || LogLevel.info;
		return level;
	}

	trace(message: string): void {
		this.logBuilder.trace(message);
	}

	debug(message: string): void {
		this.logBuilder.debug(message);
	}

	info(message: string): void {
		this.logBuilder.info(message);
	}

	warn(message: string): void {
		this.logBuilder.warn(message);
	}

	error(message: string): void {
		this.logBuilder.error(message);
	}

	fatal(message: string): void {
		this.logBuilder.fatal(message);
	}

	withData(metadata: Record<string, unknown>): ILogger {
		const newLogger = new LogLayerLogger(this.config);
		newLogger.logBuilder = this.logLayer.withMetadata(metadata);
		return newLogger;
	}

	withError(error: Error): ILogger {
		const newLogger = new LogLayerLogger(this.config);
		newLogger.logBuilder = this.logLayer.withError(error);
		return newLogger;
	}
}

export { LogLayerLogger as LoggerService };
