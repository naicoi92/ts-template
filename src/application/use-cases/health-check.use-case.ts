import { inject, injectable } from "tsyringe";
import type { IConfig } from "@/domain/interfaces/config.interface";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import { TOKENS } from "@/tokens";

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

@injectable()
export class HealthCheckUseCase {
	constructor(
		@inject(TOKENS.CONFIG_SERVICE) readonly config: IConfig,
		@inject(TOKENS.LOGGER_SERVICE) readonly logger: ILogger,
	) {}

	async execute(): Promise<HealthCheckOutput> {
		this.logger.info("Performing health check");

		const checks = {
			api: this.checkAPI(),
		};

		const isHealthy = Object.values(checks).every(
			(check) => check.status === "up",
		);

		const result: HealthCheckOutput = {
			status: isHealthy ? "healthy" : "unhealthy",
			version: this.config.version,
			timestamp: new Date().toISOString(),
			checks,
		};

		this.logger
			.withData({
				status: result.status,
			})
			.info("Health check completed");

		return result;
	}

	private checkAPI(): HealthCheckStatus {
		// Basic API health check - if we can execute this code, API is operational
		return {
			status: "up",
			message: "API is operational",
			details: {
				environment: this.config.nodeEnv,
				uptime: process.uptime(),
			},
		};
	}
}
