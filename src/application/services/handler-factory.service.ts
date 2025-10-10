import { match } from "path-to-regexp";
import { inject, injectAll, injectable } from "tsyringe";
import type { IRequestHandler } from "@/domain/interfaces/http-routing.interface";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import { TOKENS } from "@/tokens";

/**
 * Handler Factory Service
 *
 * Single Responsibility: Finds appropriate handlers for HTTP requests
 * - Auto-discovers handlers via dependency injection
 * - Performs URL pattern matching and parameter validation
 * - Does NOT execute handlers, only finds and validates them
 * - Returns RouteNotFoundHandler when no route matches
 */
@injectable()
export class HandlerFactory {
	constructor(
		@injectAll(TOKENS.REQUEST_HANDLER)
		private readonly handlers: IRequestHandler[],
		@inject(TOKENS.LOGGER_SERVICE)
		private readonly logger: ILogger,
		@inject(TOKENS.ROUTE_NOT_FOUND_HANDLER)
		private readonly routeNotFoundHandler: IRequestHandler,
	) {}

	/**
	 * Finds a matching handler for the given pathname and method
	 * @param pathname - The request pathname
	 * @param method - The HTTP method (will be normalized to uppercase)
	 * @returns Handler match with validated parameters, or RouteNotFoundHandler if no match
	 */
	findHandler(
		pathname: string,
		method: string,
	): { handler: IRequestHandler; params: unknown } {
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

			return {
				handler,
				params: matchResult,
			};
		}

		// No handler found after checking all handlers
		this.logger
			.withData({
				pathname,
				method: normalizedMethod,
			})
			.debug("No handler found, returning RouteNotFoundHandler");

		return {
			handler: this.routeNotFoundHandler,
			params: {},
		};
	}
}
