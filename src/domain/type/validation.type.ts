/**
 * Source of validation error
 * - params: Path parameters from URL (e.g., /invoices/:id)
 * - query: Query parameters from URL (e.g., ?page=1&limit=20)
 * - body: Request body (POST/PUT/PATCH)
 */
export type ValidationErrorSource = "params" | "query" | "body";

/**
 * Single validation error detail
 * Used to construct error response for client
 */
export interface ValidationErrorDetail {
	/** Where the error occurred: params, query, or body */
	readonly source: ValidationErrorSource;
	/** Field path (e.g., "amount" or "items.0.quantity") */
	readonly field: string;
	/** Human-readable error message */
	readonly message: string;
	/** Zod error code (e.g., "invalid_type", "too_small") */
	readonly code: string;
}

/**
 * List of validation errors
 * Thrown when Zod validation fails
 */
export interface ValidationErrorList {
	readonly errors: readonly ValidationErrorDetail[];
}

/**
 * Validated request data passed to handler
 * Types are inferred from Zod schemas
 */
export interface ValidatedRequestData<TParams, TQuery, TBody> {
	/** Validated path parameters */
	readonly params: TParams;
	/** Validated query parameters */
	readonly query: TQuery;
	/** Validated request body */
	readonly body: TBody;
	/** Original HTTP request */
	readonly request: Request;
}
