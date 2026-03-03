import type { HealthStatus } from "../type";

export class HealthCheckDependencyError extends Error {
	constructor(
		public readonly dependency: string,
		public readonly rootCause: unknown,
	) {
		super(`health check failed for dependency: ${dependency}`);
		this.name = "HealthCheckDependencyError";
	}

	get causeMessage(): string {
		if (this.rootCause instanceof Error) {
			return this.rootCause.message;
		}

		return String(this.rootCause);
	}
}

export class ServiceUnhealthyError extends Error {
	constructor(public readonly health: HealthStatus) {
		super("service unhealthy");
		this.name = "ServiceUnhealthyError";
	}

	toJSON(): Record<string, unknown> {
		return {
			status: this.health.status,
			timestamp: this.health.timestamp,
			error: this.health.error,
			details: this.health.details,
		};
	}
}
