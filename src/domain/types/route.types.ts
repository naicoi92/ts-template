import { z } from "zod";

/**
 * Route-related Domain Types
 *
 * Types and schemas for HTTP route parameters and routing
 */

/**
 * HTTP Methods Union Type
 *
 * Type-safe HTTP method definitions for request handlers
 */
export type HttpMethod =
	| "GET"
	| "POST"
	| "PUT"
	| "PATCH"
	| "DELETE"
	| "HEAD"
	| "OPTIONS";

/**
 * Schema for empty route parameters
 * Used by handlers that don't require any URL parameters
 */
export const EmptyParamsSchema = z.object({});

/**
 * Type for empty route parameters
 * Inferred from EmptyParamsSchema
 */
export type EmptyParams = z.infer<typeof EmptyParamsSchema>;
