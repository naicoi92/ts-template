import { type ILogBuilder, LogBuilder, LogLayer, type LogLayerTransport } from "loglayer";
import { serializeError } from "serialize-error";
import type { Config, Logger } from "../../domain/interface";

export class LogLayerLogger implements Logger {
	#logBuilder?: ILogBuilder;
	#logLayer?: LogLayer;
	constructor(
		private readonly deps: {
			config: Config;
			logTransports: LogLayerTransport[];
		},
	) {}

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

	withTraceId(prefix: string): Logger {
		const childLogLayer = this.logLayer.child().withContext({
			traceId: `${prefix}-${Date.now()}`,
		});
		return this.withLogLayer(childLogLayer);
	}

	withData(metadata: Record<string, unknown>): Logger {
		if (this.#logBuilder) {
			this.#logBuilder.withMetadata(metadata);
		} else {
			this.#logBuilder = this.logLayer.withMetadata(metadata);
		}
		return this;
	}

	withError(error: Error): Logger {
		if (this.#logBuilder) {
			this.#logBuilder.withError(error);
		} else {
			this.#logBuilder = this.logLayer.withError(error);
		}
		return this;
	}

	private withLogLayer(logLayer: LogLayer) {
		this.#logLayer = logLayer;
		this.#logBuilder = new LogBuilder(logLayer);
		return this;
	}

	private get logLayer() {
		if (!this.#logLayer) {
			this.#logLayer = new LogLayer({
				errorSerializer: serializeError,
				transport: this.transports,
			});
		}
		return this.#logLayer;
	}

	private get logBuilder() {
		if (!this.#logBuilder) {
			this.#logBuilder = new LogBuilder(this.logLayer);
		}
		return this.#logBuilder;
	}

	private get transports(): LogLayerTransport[] {
		return this.deps.logTransports;
	}
}
