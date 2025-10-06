import { ApplicationError } from "./application.error";

/**
 * Error for resource conflicts (e.g., duplicate creation)
 */
export class ConflictError extends ApplicationError {
	constructor(
		message: string = "Resource conflict occurred",
		public readonly resource?: string,
		public readonly field?: string,
	) {
		super(message, "CONFLICT", 409, { resource, field });
	}
}
