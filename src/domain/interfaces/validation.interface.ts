import type z from "zod";

/**
 * Validation Interfaces - Domain Layer
 *
 * Abstract interfaces for data validation operations
 * Pure domain logic, no infrastructure dependencies
 */

/**
 * Interface for schema validation operations
 * Domain-level abstraction for data validation
 */
export interface ISchemaValidator {
	/**
	 * Validates data against a schema
	 * @param data - Raw data to validate
	 * @param schema - Schema to validate against
	 * @returns Validated and typed data
	 * @throws DomainValidationError if validation fails
	 */
	validate<T>(data: unknown, schema: z.ZodSchema<T>): T;
}
