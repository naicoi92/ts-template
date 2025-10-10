import { inject, injectable } from "tsyringe";
import type z from "zod";
import type { IRequestHandler } from "@/domain/interfaces/http-routing.interface";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import type { ISchemaValidator } from "@/domain/interfaces/validation.interface";
import { TOKENS } from "@/tokens";
import type { HttpErrorHandler } from "./error-handler.service";
import type { HandlerFactory } from "./handler-factory.service";

/**
 * HTTP Router Service
 *
 * Single Responsibility: Processes HTTP requests with full validation
 * - Uses HandlerFactory to find appropriate handlers
 * - Validates query parameters and request body
 * - Executes handlers with validated data
 * - Centralized error handling
 */
@injectable()
export class HttpRouter {
	constructor(
		@inject(TOKENS.HANDLER_FACTORY)
		private readonly handlerFactory: HandlerFactory,
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
			// Find handler for path and method (params validated by HandlerFactory)
			const { handler, params } = this.handlerFactory.findHandler(
				url.pathname,
				request.method,
			);

			const response = await this.executeHandler(handler, request, url, params);

			this.logger
				.withData({
					handler: handler.constructor.name,
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
	 * Executes a handler with validated params, query, and body
	 * @param handlerMatch - The matched handler with all validated data
	 * @param request - The incoming request
	 * @returns Promise resolving to HTTP response
	 */
	async executeHandler<TParams, TQuery, TBody>(
		handler: IRequestHandler<TParams, TQuery, TBody>,
		request: Request,
		url: URL,
		requestParams: unknown,
	): Promise<Response> {
		// Parse and validate query parameters
		const params = this.validateParams<TParams>(
			requestParams,
			handler.paramsSchema,
		);
		// Parse and validate query parameters
		const query = this.validateQueryParams<TQuery>(url, handler.querySchema);

		// Parse and validate request body
		const body = await this.validateRequestBody<TBody>(
			request,
			handler.bodySchema,
		);

		this.logger
			.withData({
				handler: handler.constructor.name,
				query,
				body,
			})
			.debug("Executing handler");

		// Execute handler with all validated data - errors will bubble up to handle method
		const response = await handler.handle(request, {
			params,
			query,
			body,
		});

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

	/**
	 * Parses request body based on content type
	 * @param request - The incoming HTTP request
	 * @returns Promise resolving to parsed body data
	 */
	private async parseRequestBody(request: Request): Promise<unknown> {
		const contentType = request.headers.get("content-type");

		// Handle JSON body
		if (contentType?.includes("application/json")) {
			try {
				return await request.json();
			} catch (error) {
				throw new Error(`Invalid JSON body: ${(error as Error).message}`);
			}
		}

		// For other content types, return null for now
		// Can be extended to handle form data, text, etc.
		return null;
	}

	/**
	 * Validates query parameters against a schema
	 * @param url - The URL containing query parameters
	 * @param schema - Optional schema for validation
	 * @returns Validated query parameters
	 */
	private validateQueryParams<T>(url: URL, schema?: z.ZodSchema<T>): T {
		if (!schema) {
			return undefined as T;
		}
		const rawQuery = Object.fromEntries(url.searchParams.entries());
		return this.schemaValidator.validate(rawQuery, schema);
	}

	/**
	 * Validates request body against a schema
	 * @param request - The incoming HTTP request
	 * @param schema - Optional schema for validation
	 * @returns Validated request body
	 */
	private async validateRequestBody<T>(
		request: Request,
		schema?: z.ZodSchema<T>,
	): Promise<T> {
		if (!schema) {
			return undefined as T;
		}
		const rawBody = await this.parseRequestBody(request);
		return this.schemaValidator.validate(rawBody, schema);
	}
	private validateParams<T>(params: unknown, schema?: z.ZodSchema<T>): T {
		if (!schema) {
			return undefined as T;
		}
		return this.schemaValidator.validate(params, schema);
	}
}
