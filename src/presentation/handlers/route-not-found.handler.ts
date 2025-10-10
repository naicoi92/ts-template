import { inject, injectable } from "tsyringe";
import type { IRequestHandler } from "@/domain/interfaces/http-routing.interface";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import { TOKENS } from "@/tokens";

/**
 * Route Not Found Request Handler
 *
 * Single Responsibility: Handles requests for which no route was found
 * - Returns standardized 404 responses
 * - Logs attempted route access for debugging
 * - Provides consistent error messaging
 */
@injectable()
export class RouteNotFoundHandler implements IRequestHandler {
	// Using wildcard pattern to match any path
	readonly pathname = "*";
	readonly method = "GET" as const;

	constructor(
		@inject(TOKENS.LOGGER_SERVICE) private readonly logger: ILogger,
	) {}

	/**
	 * Handles route not found requests
	 * @param request - The incoming HTTP request
	 * @param _data - Empty validated data object
	 * @returns Promise resolving to HTTP 404 response
	 */
	async handle(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const method = request.method;
		const path = url.pathname;

		// Log the 404 attempt for debugging
		this.logger
			.withData({
				method,
				path,
				userAgent: request.headers.get("user-agent"),
				timestamp: new Date().toISOString(),
			})
			.warn("Route not found");

		// Return standardized 404 response
		return Response.json(
			{
				error: "Not Found",
				message: `No route found for ${method} ${path}`,
				timestamp: new Date().toISOString(),
			},
			{
				status: 404,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-cache, no-store, must-revalidate",
				},
			},
		);
	}
}
