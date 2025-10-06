/**
 * Domain Validation Errors
 *
 * Custom error types following Domain-Driven Design principles
 * These errors are domain-specific and independent of infrastructure concerns
 */

/**
 * Base class for all domain validation errors
 */
export abstract class DomainValidationError extends Error {
	constructor(
		message: string,
		public readonly code: string,
	) {
		super(message);
		this.name = this.constructor.name;
	}
}

/**
 * Error for invalid HTTP request body format
 * Thrown when request body cannot be parsed or is malformed
 */
export class InvalidRequestError extends DomainValidationError {
	constructor(
		message: string = "Invalid request body format",
		public readonly details?: Record<string, unknown>,
	) {
		super(message, "INVALID_REQUEST");
	}
}

/**
 * Error for schema validation failures
 * Thrown when data doesn't conform to expected schema
 */
export class SchemaValidationError extends DomainValidationError {
	constructor(
		message: string = "Schema validation failed",
		public readonly fieldErrors: Record<string, string[]> = {},
	) {
		super(message, "SCHEMA_VALIDATION");
	}
}

/**
 * Error for invalid JSON format
 * Specific type of InvalidRequestError for JSON parsing failures
 */
export class InvalidJsonError extends InvalidRequestError {
	constructor(
		message: string = "Invalid JSON format",
		public readonly originalError?: Error,
	) {
		super(message, { originalError: originalError?.message });
	}
}
