import type { Handler, HealthCheckService } from "../../domain/interface";
import { HealthResponseSchema } from "../../domain/schema";
import type { HealthResponse } from "../../domain/type";

/**
 * Health Check Handler
 *
 * Endpoint to verify the server is running and database is connected.
 * Used by load balancers, monitoring tools, and Kubernetes probes.
 *
 * GET /health
 * Response: { success: true, data: { status: "healthy" | "unhealthy", timestamp: "..." } }
 */
export class HealthHandler
	implements Handler<HealthResponse, void, void, void>
{
	readonly pathname = "/health";
	readonly method = "GET";
	readonly responseSchema = HealthResponseSchema;

	constructor(
		private readonly _deps: {
			healthCheckService: HealthCheckService;
		},
	) {}

	async handle(): Promise<HealthResponse> {
		const health = await this._deps.healthCheckService.check();
		if (health.status !== "healthy") throw new Error("Service unhealthy");
		return {
			status: health.status,
			timestamp: health.timestamp,
		};
	}
}
