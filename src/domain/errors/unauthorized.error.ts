import { ApplicationError } from "./application.error";

/**
 * Error for authentication failures
 */
export class UnauthorizedError extends ApplicationError {
	constructor(message: string = "Authentication required") {
		super(message, "UNAUTHORIZED", 401);
	}
}
