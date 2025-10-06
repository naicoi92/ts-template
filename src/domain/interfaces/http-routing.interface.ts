import type { z } from "zod";
import type { HttpMethod } from "@/domain/types";

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
export interface IRequestHandler<TParams = unknown> {
	/** URL pathname pattern for route matching */
	readonly pathname: string;

	/** HTTP method for this handler with type safety */
	readonly method: HttpMethod;

	/** Zod schema for parameter validation and type inference */
	readonly paramsSchema: z.ZodSchema<TParams>;

	/**
	 * Handles an HTTP request with validated parameters and body
	 * @param request - The incoming HTTP request
	 * @param params - Validated route parameters with specific typing
	 * @returns Promise resolving to HTTP response
	 */
	handle(request: Request, params: TParams): Promise<Response>;
}
