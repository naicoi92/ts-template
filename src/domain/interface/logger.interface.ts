export interface Logger {
	debug(message: string): void;
	info(message: string): void;
	warn(message: string): void;
	error(message: string): void;
	withData(metadata: Record<string, unknown>): Logger;
	withError(error: Error): Logger;
}
