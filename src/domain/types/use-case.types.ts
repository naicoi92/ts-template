/**
 * Use Case Types
 *
 * Types for use case inputs and outputs
 * Domain layer definitions for application use cases
 */

/**
 * Health check related types
 */
export interface HealthCheckStatus {
	status: "up" | "down";
	message: string;
	details?: Record<string, unknown>;
}

export interface HealthCheckOutput {
	status: "healthy" | "unhealthy";
	version: string;
	timestamp: string;
	checks: {
		api: HealthCheckStatus;
	};
}

/**
 * Hello world related types
 */
export interface HelloWorldOutput {
	message: string;
	appName: string;
	environment: string;
	timestamp: string;
}
