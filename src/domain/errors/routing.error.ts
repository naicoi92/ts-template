import { ApplicationError } from "./application.error";

/**
 * Error for when no route matches the request path and method
 */
export class RouteNotFoundError extends ApplicationError {
	constructor(path: string, method?: string) {
		const message = method
			? `No route found for ${method} ${path}`
			: `No route found for path: ${path}`;

		const details = method ? { path, method } : { path };

		super(message, "ROUTE_NOT_FOUND", 404, details);
	}
}
