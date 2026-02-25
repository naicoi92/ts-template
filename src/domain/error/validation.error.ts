import type {
	ValidationErrorDetail,
	ValidationErrorList,
	ValidationErrorSource,
} from "../type/validation.type";

/**
 * Domain error for validation failures
 * Thrown when Zod schema validation fails
 *
 * @example
 * try {
 *   schema.parse(data);
 * } catch (error) {
 *   if (error instanceof z.ZodError) {
 *     throw new RequestValidationError(formatZodErrors(error));
 *   }
 * }
 */
export class RequestValidationError extends Error {
	constructor(public readonly errors: readonly ValidationErrorDetail[]) {
		super("Request validation failed");
		this.name = "RequestValidationError";
	}

	/**
	 * Check if error has validation errors for specific source
	 */
	hasErrorsFor(source: ValidationErrorSource): boolean {
		return this.errors.some((e) => e.source === source);
	}

	/**
	 * Get errors for specific source
	 */
	getErrorsFor(source: ValidationErrorSource): ValidationErrorDetail[] {
		return this.errors.filter((e) => e.source === source);
	}

	/**
	 * Convert to JSON-serializable format for API response
	 */
	toJSON(): ValidationErrorList {
		return {
			errors: this.errors,
		};
	}
}

/**
 * Format Zod validation issues into ValidationErrorDetail array
 *
 * @param zodError - Zod validation error
 * @param source - Where the error occurred (params/query/body)
 * @returns Array of formatted validation error details
 */
export function formatZodError(
	zodError: z.ZodError,
	source: ValidationErrorSource,
): ValidationErrorDetail[] {
	return zodError.issues.map((issue) => ({
		source,
		field: issue.path.join("."),
		message: issue.message,
		code: issue.code,
	}));
}

// Import z for type annotation
import type { z } from "zod";
