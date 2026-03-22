import type { RequestValidationError, ServiceUnhealthyError } from "../../domain/error";

/**
 * ErrorSerializer - Presentation layer serializer for domain errors
 *
 * Responsibilities:
 * - Convert domain errors to HTTP response format
 * - Whitelist safe fields for client exposure
 * - Hide internal diagnostics
 *
 * Clean Architecture: This class belongs to presentation layer,
 * NOT domain layer. Domain errors should not know about serialization.
 */
export class ErrorSerializer {
	/**
	 * Serialize RequestValidationError for HTTP response
	 * Exposes validation errors - safe for client
	 */
	serializeValidation(error: RequestValidationError): { errors: readonly unknown[] } {
		return {
			errors: error.errors,
		};
	}

	/**
	 * Serialize ServiceUnhealthyError for HTTP response
	 * WHITELIST: Only expose status and timestamp
	 * HIDE: error, details (internal diagnostics)
	 */
	serializeHealth(error: ServiceUnhealthyError): { status: string; timestamp: string } {
		const health = error.health;
		return {
			status: health.status,
			timestamp: health.timestamp,
		};
	}
}
