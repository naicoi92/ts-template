import type { Handler, HealthCheckService } from "../../domain/interface";
import { ResponseFactory } from "../factory/response.factory";

/**
 * Health Check Handler
 *
 * Endpoint to verify the server is running and database is connected.
 * Used by load balancers, monitoring tools, and Kubernetes probes.
 *
 * GET /health
 * Response: { success: true, data: { status: "healthy" | "unhealthy", timestamp: "..." } }
 */
export class HealthHandler implements Handler<void, void, void> {
	readonly pathname = "/health";
	readonly method = "GET";
	// No schemas needed for health check

	constructor(
		private readonly _deps: {
			healthCheckService: HealthCheckService;
		},
	) {}

	async handle(_data: { request: Request }): Promise<Response> {
		const health = await this._deps.healthCheckService.check();

		if (health.status === "healthy") {
			return ResponseFactory.success({
				status: "healthy",
				timestamp: health.timestamp,
			});
		}

		return ResponseFactory.error(health.error ?? "Service unhealthy", 503);
	}
}
