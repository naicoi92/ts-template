import type { z } from "zod";
import type { ValidatedRequestData } from "../type/validation.type";

/**
 * HTTP Request Handler Interface
 *
 * Handlers are responsible for:
 * 1. Declaring validation schemas for params/query/body
 * 2. Processing validated request data
 * 3. Calling the appropriate use case
 * 4. Returning HTTP response
 *
 * @template TParams - Type of path parameters (e.g., { id: string } for /users/:id)
 * @template TQuery - Type of query parameters (e.g., { page: number, limit: number })
 * @template TBody - Type of request body (e.g., { name: string, email: string })
 *
 * @example
 * // Handler with body validation only
 * class CreateInvoiceHandler implements RequestHandler<void, void, InvoiceCreateInput> {
 *   readonly bodySchema = InvoiceCreateInputSchema;
 *
 *   async handle({ body, request }) {
 *     // body is typed as InvoiceCreateInput (already validated)
 *   }
 * }
 *
 * @example
 * // Handler with path params
 * class GetInvoiceHandler implements RequestHandler<{ invoiceId: string }, void, void> {
 *   readonly paramsSchema = z.object({ invoiceId: z.string().uuid() });
 *
 *   async handle({ params }) {
 *     // params.invoiceId is typed as string
 *   }
 * }
 */
export interface RequestHandler<
	TParams = undefined,
	TQuery = undefined,
	TBody = undefined,
> {
	readonly pathname: string;

	/**
	 * Zod schema for path parameter validation
	 * Optional: only define if the endpoint has path params (e.g., /users/:id)
	 *
	 * @example
	 * readonly paramsSchema = z.object({ id: z.string().uuid() });
	 */
	readonly paramsSchema?: z.ZodSchema<TParams>;

	/**
	 * Zod schema for query parameter validation
	 * Optional: only define if the endpoint accepts query params
	 *
	 * Note: Query params are always strings from URL. Use z.coerce to convert:
	 * @example
	 * readonly querySchema = z.object({
	 *   page: z.coerce.number().int().default(1),  // "1" -> 1
	 *   limit: z.coerce.number().int().default(20), // "20" -> 20
	 * });
	 */
	readonly querySchema?: z.ZodSchema<TQuery>;

	/**
	 * Zod schema for request body validation
	 * Optional: only define for POST/PUT/PATCH endpoints
	 *
	 * @example
	 * readonly bodySchema = z.object({
	 *   name: z.string().min(1),
	 *   email: z.string().email(),
	 * });
	 */
	readonly bodySchema?: z.ZodSchema<TBody>;

	/**
	 * Handle the validated HTTP request
	 *
	 * This method receives already-validated data from ValidationAdapter.
	 * All params/query/body have been validated against their schemas.
	 *
	 * @param data - Validated request data
	 * @param data.params - Path parameters (validated by paramsSchema)
	 * @param data.query - Query parameters (validated by querySchema)
	 * @param data.body - Request body (validated by bodySchema)
	 * @param data.request - Original HTTP request (for headers, method, etc.)
	 * @returns HTTP Response
	 */
	handle(data: ValidatedRequestData<TParams, TQuery, TBody>): Promise<Response>;
}

/**
 * Fetch Handler Interface
 *
 * Low-level handler that receives raw Request without validation.
 * Used for health checks, static files, or when custom parsing is needed.
 *
 * @example
 * class HealthCheckHandler implements FetchHandler {
 *   async handle(request: Request) {
 *     return Response.json({ status: "ok" });
 *   }
 * }
 */
export interface FetchHandler {
	handle(request: Request): Promise<Response>;
}
