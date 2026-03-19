export interface Logger {
	debug(message: string): void;
	info(message: string): void;
	warn(message: string): void;
	error(message: string): void;
	withTraceId(prefix: string): Logger;
	withData(metadata: Record<string, unknown>): Logger;
	withError(error: Error): Logger;
	withTraceId(traceId: string): Logger;
}
