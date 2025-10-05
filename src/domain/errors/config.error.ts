export class InvalidConfigError extends Error {
	constructor(
		public field: string,
		public reason: string,
		public details?: Record<string, unknown>,
	) {
		super(`Invalid configuration for ${field}: ${reason}`);
		this.name = "InvalidConfigError";
		Object.setPrototypeOf(this, InvalidConfigError.prototype);
	}
}
