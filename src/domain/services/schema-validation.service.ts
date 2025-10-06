import { z } from "zod";
import { SchemaValidationError } from "@/domain/errors/validation.errors";
import type { ISchemaValidator } from "@/domain/interfaces/validation.interface";

/**
 * Schema Validation Service
 *
 * Domain service for validating data against schemas
 * Single Responsibility: Only handles schema validation logic
 * No dependencies on infrastructure or HTTP concerns
 * Implements ISchemaValidator interface
 */

/**
 * Concrete implementation of schema validation service
 */
export class SchemaValidationService implements ISchemaValidator {
	validate<T>(data: unknown, schema: z.ZodSchema<T>): T {
		try {
			return schema.parse(data);
		} catch (error) {
			if (error instanceof z.ZodError) {
				const fieldErrors: Record<string, string[]> = {};

				error.issues.forEach((issue) => {
					const field = issue.path.join(".");
					if (!fieldErrors[field]) {
						fieldErrors[field] = [];
					}
					fieldErrors[field].push(issue.message);
				});

				throw new SchemaValidationError(
					"Schema validation failed",
					fieldErrors,
				);
			}

			// Re-throw unexpected errors
			throw error;
		}
	}
}
