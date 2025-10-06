import { ApplicationError } from "./application.error";

/**
 * Error for when no route matches the request path
 */
export class RouteNotFoundError extends ApplicationError {
	constructor(path: string) {
		super(`No route found for path: ${path}`, "ROUTE_NOT_FOUND", 404, { path });
	}
}
