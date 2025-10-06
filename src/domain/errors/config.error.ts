import { ApplicationError } from "./application.error";

export class InvalidConfigError extends ApplicationError {
	constructor(
		public field: string,
		public reason: string,
		details?: Record<string, unknown>,
	) {
		super(
			`Invalid configuration for ${field}: ${reason}`,
			"INVALID_CONFIG",
			500,
			{ field, reason, ...details },
		);
	}
}
