import type { ValidationErrorDetail } from "../../domain/type/validation.type";

/**
 * API Response success envelope
 * All successful responses follow this structure
 */
interface ApiSuccessResponse<T> {
	readonly success: true;
	readonly data: T;
}

/**
 * API Response error envelope
 * All error responses follow this structure
 */
interface ApiErrorResponse {
	readonly success: false;
	readonly error: string;
	readonly details?: readonly ValidationErrorDetail[];
}

/**
 * Response Factory
 *
 * Factory Pattern: Creates consistent HTTP responses across all handlers.
 * Ensures all API responses have the same structure.
 *
 * Benefits:
 * - Consistent response format (DRY)
 * - Single place to modify response structure
 * - Type-safe response creation
 * - Easy to test
 *
 * @example
 * // Success response
 * return ResponseFactory.success({ id: 1, name: "John" });
 * // => { success: true, data: { id: 1, name: "John" } }
 *
 * @example
 * // Error response
 * return ResponseFactory.notFound("Invoice");
 * // => { success: false, error: "Invoice not found" }
 */

export class ResponseFactory {
	/**
	 * Create a successful response (200 OK)
	 */
	static success<T>(data: T): Response {
		const body: ApiSuccessResponse<T> = {
			success: true,
			data,
		};
		return Response.json(body, { status: 200 });
	}

	/**
	 * Create a created response (201 Created)
	 * Used after successful POST requests
	 */
	static created<T>(data: T): Response {
		const body: ApiSuccessResponse<T> = {
			success: true,
			data,
		};
		return Response.json(body, { status: 201 });
	}

	/**
	 * Create a no content response (204 No Content)
	 * Used after successful DELETE requests
	 */
	static noContent(): Response {
		return new Response(null, { status: 204 });
	}

	/**
	 * Create a bad request response (400 Bad Request)
	 * Used for validation errors
	 */
	static badRequest(
		message: string,
		details?: readonly ValidationErrorDetail[],
	): Response {
		const body: ApiErrorResponse = {
			success: false,
			error: message,
			details,
		};
		return Response.json(body, { status: 400 });
	}

	/**
	 * Create an unauthorized response (401 Unauthorized)
	 * Used when authentication is required but missing/invalid
	 */
	static unauthorized(message = "Unauthorized"): Response {
		const body: ApiErrorResponse = {
			success: false,
			error: message,
		};
		return Response.json(body, { status: 401 });
	}

	/**
	 * Create a forbidden response (403 Forbidden)
	 * Used when user lacks permission
	 */
	static forbidden(message = "Forbidden"): Response {
		const body: ApiErrorResponse = {
			success: false,
			error: message,
		};
		return Response.json(body, { status: 403 });
	}

	/**
	 * Create a not found response (404 Not Found)
	 * Used when requested resource doesn't exist
	 */
	static notFound(resource: string): Response {
		const body: ApiErrorResponse = {
			success: false,
			error: `${resource} not found`,
		};
		return Response.json(body, { status: 404 });
	}

	/**
	 * Create a conflict response (409 Conflict)
	 * Used for duplicate resources or constraint violations
	 */
	static conflict(message: string): Response {
		const body: ApiErrorResponse = {
			success: false,
			error: message,
		};
		return Response.json(body, { status: 409 });
	}

	/**
	 * Create an internal server error response (500 Internal Server Error)
	 * Used for unexpected errors
	 */
	static internalError(message = "Internal server error"): Response {
		const body: ApiErrorResponse = {
			success: false,
			error: message,
		};
		return Response.json(body, { status: 500 });
	}

	/**
	 * Create a validation error response (400 Bad Request)
	 * Specialized for Zod validation errors
	 */
	static validationError(errors: readonly ValidationErrorDetail[]): Response {
		const body: ApiErrorResponse = {
			success: false,
			error: "Validation failed",
			details: errors,
		};
		return Response.json(body, { status: 400 });
	}

	/**
	 * Create a custom error response
	 * For non-standard HTTP status codes
	 */
	static error(
		message: string,
		status: number,
		details?: readonly ValidationErrorDetail[],
	): Response {
		const body: ApiErrorResponse = {
			success: false,
			error: message,
			details,
		};
		return Response.json(body, { status });
	}
}
