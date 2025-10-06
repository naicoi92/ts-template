import { inject, injectAll, injectable } from "tsyringe";
import type { z } from "zod";
import type { IRequestHandler } from "@/domain/interfaces/http-routing.interface";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import { TOKENS } from "@/tokens";

/**
 * Type-safe handler match result
 */
type HandlerMatch<TParams = unknown> = {
	handler: IRequestHandler<TParams>;
	params: TParams;
};

/**
 * HTTP Router Service
 *
 * Single Responsibility: Routes HTTP requests to appropriate handlers
 * - Auto-discovers handlers via dependency injection
 * - Performs URL pattern matching and parameter validation
 * - Dispatches requests to matching handlers with full type safety
 */
@injectable()
export class HttpRouter {
	constructor(
		@injectAll(TOKENS.REQUEST_HANDLER)
		private readonly handlers: IRequestHandler[],
		@inject(TOKENS.LOGGER_SERVICE)
		private readonly logger: ILogger,
	) {}

	/**
	 * Handles an HTTP request by finding and executing the appropriate handler
	 * @param request - The incoming HTTP request
	 * @returns Promise resolving to HTTP response
	 */
	async handle(request: Request): Promise<Response> {
		const url = new URL(request.url);

		this.logger
			.withData({
				method: request.method,
				path: url.pathname,
			})
			.debug("Processing HTTP request");

		const handlerMatch = this.findHandler(url.pathname);

		if (!handlerMatch) {
			this.logger
				.withData({ path: url.pathname })
				.debug("No handler found for request");

			return Response.json(
				{
					error: {
						code: "NOT_FOUND",
						message: "Route not found",
					},
					timestamp: new Date().toISOString(),
				},
				{ status: 404 },
			);
		}

		// Execute handler with full type safety
		return this.executeHandler(
			handlerMatch.handler,
			handlerMatch.params,
			request,
		);
	}

	/**
	 * Finds a matching handler for the given pathname with type safety
	 * @param pathname - The request pathname
	 * @returns Handler match with validated parameters or null
	 */
	private findHandler(pathname: string): HandlerMatch | null {
		for (const handler of this.handlers) {
			const pattern = new URLPattern({ pathname: handler.pathname });
			const match = pattern.exec({ pathname });

			if (match) {
				const validation = handler.paramsSchema.safeParse(
					match.pathname.groups,
				);

				if (validation.success) {
					this.logger
						.withData({
							handler: handler.constructor.name,
							pathname,
							params: validation.data,
						})
						.debug("Handler found with valid parameters");

					// Type-safe return - params are validated against handler's schema
					return {
						handler,
						params: validation.data,
					} as HandlerMatch;
				} else {
					this.logger
						.withData({
							handler: handler.constructor.name,
							pathname,
							error: validation.error.message,
						})
						.debug("Handler found but parameter validation failed");

					// Return validation error directly
					return {
						handler: {
							handle: async () =>
								this.createValidationErrorResponse(validation.error),
							paramsSchema: handler.paramsSchema,
							pathname: handler.pathname,
						},
						params: {} as never,
					};
				}
			}
		}

		return null;
	}

	/**
	 * Executes a handler with validated parameters and full type safety
	 * @param handler - The request handler to execute
	 * @param params - Validated parameters matching handler's expected type
	 * @param request - The incoming request
	 * @returns Promise resolving to HTTP response
	 */
	private async executeHandler<TParams>(
		handler: IRequestHandler<TParams>,
		params: TParams,
		request: Request,
	): Promise<Response> {
		try {
			this.logger
				.withData({
					handler: handler.constructor.name,
					params,
				})
				.debug("Executing handler");

			const response = await handler.handle(request, params);

			this.logger
				.withData({
					handler: handler.constructor.name,
					status: response.status,
				})
				.debug("Handler executed successfully");

			return response;
		} catch (error) {
			this.logger
				.withError(error as Error)
				.withData({
					handler: handler.constructor.name,
					params,
				})
				.error("Handler execution failed");

			return Response.json(
				{
					error: {
						code: "INTERNAL_SERVER_ERROR",
						message: "Internal server error",
					},
					timestamp: new Date().toISOString(),
				},
				{ status: 500 },
			);
		}
	}

	/**
	 * Creates a validation error response
	 * @param validationError - The Zod validation error
	 * @returns Validation error response
	 */
	private createValidationErrorResponse(validationError: z.ZodError): Response {
		return Response.json(
			{
				error: {
					code: "VALIDATION_ERROR",
					message: validationError.message,
					details: validationError.issues,
				},
				timestamp: new Date().toISOString(),
			},
			{ status: 400 },
		);
	}
}
