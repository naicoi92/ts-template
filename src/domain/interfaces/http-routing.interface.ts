import type { z } from "zod";

/**
 * HTTP Routing Interfaces - Clean Architecture
 *
 * Simple interfaces for type-safe request handling with Zod validation
 * Supports both parameter and body schema validation
 */

/**
 * Request Handler Interface with Type Safety
 *
 * Generic parameter type allows for specific parameter typing
 * while maintaining schema validation for both parameters and body
 */
export interface IRequestHandler<TParams = unknown, TBody = unknown> {
	/** URL pathname pattern for route matching */
	readonly pathname: string;

	/** Zod schema for parameter validation and type inference */
	readonly paramsSchema: z.ZodSchema<TParams>;

	/** Optional Zod schema for request body validation */
	readonly bodySchema?: z.ZodSchema<TBody>;

	/**
	 * Handles an HTTP request with validated parameters and body
	 * @param request - The incoming HTTP request
	 * @param params - Validated route parameters with specific typing
	 * @returns Promise resolving to HTTP response
	 */
	handle(request: Request, params: TParams): Promise<Response>;
}
