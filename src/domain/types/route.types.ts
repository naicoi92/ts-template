import type z from "zod";
import type { EmptyParamsSchema } from "../schemas/route.schema";

/**
 * Route-related Domain Types
 *
 * Types for HTTP route parameters and routing
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
 * Type for empty route parameters
 * Inferred from EmptyParamsSchema
 */
export type EmptyParams = z.infer<typeof EmptyParamsSchema>;
