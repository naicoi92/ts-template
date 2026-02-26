import { type ILogBuilder, LogLayer, type LogLayerTransport } from "loglayer";
import { serializeError } from "serialize-error";
import type { Config, Logger } from "../../domain/interface";

export class LogLayerLogger implements Logger {
	private logLayer: LogLayer;
	#logBuilder?: ILogBuilder;

	constructor(
		private readonly deps: {
			config: Config;
			logTransports: LogLayerTransport[];
		},
	) {
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
		return new LogLayerLogger(this.deps).withLogBuilder(
			this.logLayer.withMetadata(metadata),
		);
	}

	withError(error: Error): Logger {
		return new LogLayerLogger(this.deps).withLogBuilder(
			this.logLayer.withError(error),
		);
	}

	withLogBuilder(logBuilder: ILogBuilder) {
		this.#logBuilder = logBuilder;
		return this;
	}

	private get logBuilder(): ILogBuilder {
		if (!this.#logBuilder) this.#logBuilder = this.logLayer.withMetadata();
		return this.#logBuilder;
	}

	private get transports(): LogLayerTransport[] {
		return this.deps.logTransports;
	}
}
