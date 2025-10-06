/**
 * Domain Validation Types
 *
 * Type definitions for validation operations
 * Centralized location for all validation-related types
 */

/**
 * Result of validation operation
 */
export type ValidationResult<T> =
	| {
			success: true;
			data: T;
	  }
	| {
			success: false;
			errors: Record<string, string[]>;
	  };

/**
 * Field validation error details
 */
export type FieldValidationError = {
	field: string;
	messages: string[];
};

/**
 * Validation error collection
 */
export type ValidationErrors = Record<string, string[]>;
