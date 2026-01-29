import { type ILogBuilder, LogLayer, type LogLayerTransport } from "loglayer";
import { serializeError } from "serialize-error";
import type { Config, Logger } from "../../domain/interface";
import { LogConsoleTransport } from "./console.log-transport";
import { LogPinoTransport } from "./pino.log-transport";

export class LogLayerLogger implements Logger {
	private logLayer: LogLayer;
	#logBuilder?: ILogBuilder;
	#transports: LogLayerTransport[] = [];

	constructor(private readonly deps: { config: Config }) {
		this.logLayer = new LogLayer({
			errorSerializer: serializeError,
			transport: this.transports,
		});
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

	withData(metadata: Record<string, unknown>): Logger {
		return new LogLayerLogger({
			config: this.config,
		})
			.withTransports(this.transports)
			.withLogBuilder(this.logLayer.withMetadata(metadata));
	}

	withError(error: Error): Logger {
		return new LogLayerLogger({
			config: this.config,
		})
			.withTransports(this.transports)
			.withLogBuilder(this.logLayer.withError(error));
	}
	withTransports(transports: LogLayerTransport[]) {
		this.#transports = transports;
		return this;
	}

	withLogBuilder(logBuilder: ILogBuilder) {
		this.#logBuilder = logBuilder;
		return this;
	}

	private get transports(): LogLayerTransport[] {
		if (!this.#transports) {
			this.#transports = [
				new LogPinoTransport({ config: this.config }),
				new LogConsoleTransport({ config: this.config }),
			];
		}
		return this.#transports;
	}

	private get logBuilder(): ILogBuilder {
		if (!this.#logBuilder) this.#logBuilder = this.logLayer.withMetadata();
		return this.#logBuilder;
	}

	private get config(): Config {
		return this.deps.config;
	}
}
