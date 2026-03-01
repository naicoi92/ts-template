/**
 * Health Status
 *
 * Represents system health status information
 */
export interface HealthStatus {
	readonly status: "healthy" | "unhealthy" | "degraded";
	readonly timestamp: string;
	readonly error?: string;
	readonly details?: Record<string, unknown>;
}
