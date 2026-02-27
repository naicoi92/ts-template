import type { HealthStatus } from "../type";

/**
 * Health Check Service Interface
 *
 * Service for checking system health status.
 * Used by health endpoints to verify database connectivity.
 */
export interface HealthCheckService {
	/**
	 * Check system health
	 * @returns Health status object
	 */
	check(): Promise<HealthStatus>;
}
