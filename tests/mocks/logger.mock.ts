import type { Logger } from "../../src/domain/interface";

export class MockLogger implements Logger {
	public 	logs: {
		level: "debug" | "info" | "warn" | "error";
		message: string;
		metadata?: Record<string, unknown>;
		error?: Error;
		traceId?: string;
	}[] = [];

	private currentMetadata: Record<string, unknown> = {};
	private currentError?: Error;
	private currentTraceId?: string;

	debug(message: string): void {
		this.logs.push({
			level: "debug",
			message,
			metadata: { ...this.currentMetadata },
			error: this.currentError,
			traceId: this.currentTraceId,
		});
		this.resetContext();
	}

	info(message: string): void {
		this.logs.push({
			level: "info",
			message,
			metadata: { ...this.currentMetadata },
			error: this.currentError,
			traceId: this.currentTraceId,
		});
		this.resetContext();
	}

	warn(message: string): void {
		this.logs.push({
			level: "warn",
			message,
			metadata: { ...this.currentMetadata },
			error: this.currentError,
			traceId: this.currentTraceId,
		});
		this.resetContext();
	}

	error(message: string): void {
		this.logs.push({
			level: "error",
			message,
			metadata: { ...this.currentMetadata },
			error: this.currentError,
			traceId: this.currentTraceId,
		});
		this.resetContext();
	}

	withData(metadata: Record<string, unknown>): Logger {
		this.currentMetadata = { ...this.currentMetadata, ...metadata };
		return this;
	}

	withError(error: Error): Logger {
		this.currentError = error;
		return this;
	}

	withTraceId(traceId: string): Logger {
		this.currentTraceId = traceId;
		return this;
	}

	private resetContext(): void {
		this.currentMetadata = {};
		this.currentError = undefined;
		this.currentTraceId = undefined;
	}

	reset(): void {
		this.logs = [];
		this.currentMetadata = {};
		this.currentError = undefined;
		this.currentTraceId = undefined;
	}

	hasLog(level: string, message: string): boolean {
		return this.logs.some((log) => log.level === level && log.message.includes(message));
	}
}

export function createMockLogger(): MockLogger {
	return new MockLogger();
}
