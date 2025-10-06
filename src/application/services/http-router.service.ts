import { match } from "path-to-regexp";
import { inject, injectAll, injectable } from "tsyringe";
import { RouteNotFoundError } from "@/domain/errors/routing.error";
import type { IRequestHandler } from "@/domain/interfaces/http-routing.interface";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import type { ISchemaValidator } from "@/domain/interfaces/validation.interface";
import { TOKENS } from "@/tokens";
import type { HttpErrorHandler } from "./error-handler.service";

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
		@inject(TOKENS.HTTP_ERROR_HANDLER)
		private readonly errorHandler: HttpErrorHandler,
		@inject(TOKENS.SCHEMA_VALIDATION_SERVICE)
		private readonly schemaValidator: ISchemaValidator,
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

		try {
			// Find and validate handler for path and method
			const handlerMatch = this.findHandler(url.pathname, request.method);

			const response = await this.executeHandler(handlerMatch, request);

			this.logger
				.withData({
					handler: handlerMatch.handler.constructor.name,
					status: response.status,
				})
				.debug("Request processed successfully");

			return response;
		} catch (error) {
			// Create error context for better debugging
			const errorContext = this.createErrorContext(
				request,
				url,
				error as Error,
			);

			return this.errorHandler.handleError(error as Error, errorContext);
		}
	}

	/**
	 * Finds a matching handler for the given pathname and method
	 * @param pathname - The request pathname
	 * @param method - The HTTP method (will be normalized to uppercase)
	 * @returns Handler match with validated parameters
	 * @throws RouteNotFoundError when no route matches
	 */
	private findHandler(pathname: string, method: string): HandlerMatch {
		// Normalize HTTP method to uppercase for consistent comparison
		const normalizedMethod = method.toUpperCase();

		for (const handler of this.handlers) {
			const matchFn = match(handler.pathname);
			const matchResult = matchFn(pathname);

			// Early continue if no match
			if (!matchResult) {
				continue;
			}

			// Check HTTP method match (handler.method is already uppercase by type definition)
			if (handler.method !== normalizedMethod) {
				continue;
			}

			// We have a matching route - validate and return
			this.logger
				.withData({
					handler: handler.constructor.name,
					pathname,
					method: normalizedMethod,
				})
				.debug("Handler found for path and method");

			// Validate parameters using SchemaValidationService
			const validatedParams = this.schemaValidator.validate(
				matchResult.params,
				handler.paramsSchema,
			);

			return {
				handler,
				params: validatedParams,
			};
		}

		// No handler found after checking all handlers
		throw new RouteNotFoundError(pathname, normalizedMethod);
	}

	/**
	 * Executes a handler with validated parameters and full type safety
	 * @param handlerMatch - The matched handler with validated parameters
	 * @param request - The incoming request
	 * @returns Promise resolving to HTTP response
	 */
	private async executeHandler<TParams>(
		handlerMatch: HandlerMatch<TParams>,
		request: Request,
	): Promise<Response> {
		this.logger
			.withData({
				handler: handlerMatch.handler.constructor.name,
				params: handlerMatch.params,
			})
			.debug("Executing handler");

		// Execute handler - errors will bubble up to handle method
		const response = await handlerMatch.handler.handle(
			request,
			handlerMatch.params,
		);

		return response;
	}

	/**
	 * Creates error context with all relevant information
	 * @param request - The incoming request
	 * @param url - Parsed URL object
	 * @param error - The error that occurred
	 * @returns Error context object
	 */
	private createErrorContext(
		request: Request,
		url: URL,
		error: Error,
	): {
		handlerName?: string;
		requestMethod: string;
		requestPath: string;
		params?: unknown;
	} {
		// Extract handler name from error stack trace if available
		const handlerMatch = error.stack?.match(/at\s+(\w+RequestHandler)\./);
		const handlerName = handlerMatch?.[1];

		return {
			handlerName,
			requestMethod: request.method,
			requestPath: url.pathname,
		};
	}
}
