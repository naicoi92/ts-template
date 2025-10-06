/**
 * Domain Validation Errors
 *
 * Custom error types following Domain-Driven Design principles
 * These errors are domain-specific and independent of infrastructure concerns
 */

import { ApplicationError } from "./application.error";

/**
 * Base class for all domain validation errors
 */
export abstract class DomainValidationError extends ApplicationError {
	constructor(
		message: string,
		code: string,
		statusCode: number = 400,
		details?: Record<string, unknown>,
	) {
		super(message, code, statusCode, details);
	}
}

/**
 * Error for invalid HTTP request body format
 * Thrown when request body cannot be parsed or is malformed
 */
export class InvalidRequestError extends DomainValidationError {
	constructor(
		message: string = "Invalid request body format",
		details?: Record<string, unknown>,
	) {
		super(message, "INVALID_REQUEST", 400, details);
	}
}

/**
 * Error for schema validation failures
 * Thrown when data doesn't conform to expected schema
 */
export class SchemaValidationError extends DomainValidationError {
	constructor(
		message: string = "Schema validation failed",
		fieldErrors: Record<string, string[]> = {},
	) {
		super(message, "SCHEMA_VALIDATION", 400, { fieldErrors });
	}
}

/**
 * Error for invalid JSON format
 * Specific type of InvalidRequestError for JSON parsing failures
 */
export class InvalidJsonError extends InvalidRequestError {
	constructor(message: string = "Invalid JSON format", originalError?: Error) {
		super(message, { originalError: originalError?.message });
	}
}
