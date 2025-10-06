/**
 * Base class for all application errors
 * Provides consistent error structure across the application
 */
export abstract class ApplicationError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly statusCode: number = 500,
		public readonly details?: Record<string, unknown>,
	) {
		super(message);
		this.name = this.constructor.name;
	}

	/**
	 * Convert error to JSON format for API responses
	 */
	toJSON() {
		return {
			code: this.code,
			message: this.message,
			...(this.details && { details: this.details }),
		};
	}
}
