import { ApplicationError } from "./application.error";

/**
 * Error for authorization failures (insufficient permissions)
 */
export class ForbiddenError extends ApplicationError {
	constructor(message: string = "Insufficient permissions") {
		super(message, "FORBIDDEN", 403);
	}
}
