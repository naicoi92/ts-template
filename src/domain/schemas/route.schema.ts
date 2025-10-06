import z from "zod";

/**
 * Route Domain Schemas
 *
 * Zod schemas for HTTP route parameters validation following Clean Architecture principles
 * These schemas define the validation rules for route-related data structures
 */

/**
 * Schema for empty route parameters
 * Used by handlers that don't require any URL parameters
 */
export const EmptyParamsSchema = z.object({});
