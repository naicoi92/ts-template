import {
	InvoiceAmountMisMatch,
	InvoiceNotFoundError,
	RequestValidationError,
} from "../../domain/error";
import type { Logger } from "../../domain/interface";
import { ResponseFactory } from "../../presentation/factory/response.factory";

/**
 * Error Handler Middleware
 *
 * Centralizes error handling for the application.
 * Maps domain errors to appropriate HTTP responses.
 *
 * Benefits:
 * - Consistent error responses across all handlers
 * - Single place to modify error handling logic
 * - Easy to add new error types
 * - Logging of all errors
 */
export class ErrorHandlerMiddleware {
	constructor(private readonly _deps: { logger: Logger }) {}

	/**
	 * Handle an error and return appropriate HTTP response
	 *
	 * @param error - The error to handle
	 * @param request - The original request (for logging context)
	 * @returns HTTP Response with appropriate status code and error message
	 */
	handle(error: unknown, request?: Request): Response {
		// Log all errors
		this.logger
			.withError(error instanceof Error ? error : new Error(String(error)))
			.withData({
				url: request?.url,
				method: request?.method,
			})
			.error("Request error");

		// Handle known error types
		if (error instanceof RequestValidationError) {
			return ResponseFactory.validationError(error.errors);
		}

		if (error instanceof InvoiceNotFoundError) {
			return ResponseFactory.notFound("Invoice");
		}

		if (error instanceof InvoiceAmountMisMatch) {
			return ResponseFactory.conflict(error.message);
		}

		// Handle generic errors
		if (error instanceof SyntaxError) {
			return ResponseFactory.badRequest("Invalid JSON body");
		}

		if (error instanceof Error) {
			// Check for specific error messages
			if (error.message.includes("not found")) {
				return ResponseFactory.notFound("Resource");
			}

			// Return generic error message in development
			// In production, you might want to hide internal errors
			return ResponseFactory.internalError(error.message);
		}

		// Unknown error type
		return ResponseFactory.internalError("An unexpected error occurred");
	}

	private get logger(): Logger {
		return this._deps.logger;
	}
}
