import { HealthCheckDependencyError } from "../../domain/error";
import type { HealthCheckService } from "../../domain/interface";
import type { HealthStatus } from "../../domain/type";
import type { KyselyDatabase } from "../database";

/**
 * Database Health Check Service
 *
 * Checks database connectivity and health status
 */
export class DatabaseHealthCheckService implements HealthCheckService {
	constructor(private readonly _deps: { kysely: KyselyDatabase }) {}

	async check(): Promise<HealthStatus> {
		try {
			// Simple query to check database connectivity
			await Promise.all([this.checkDatabase()]);
			return {
				status: "healthy",
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			if (error instanceof HealthCheckDependencyError) {
				return {
					status: "unhealthy",
					timestamp: new Date().toISOString(),
					error: error.message,
					details: {
						dependency: error.dependency,
						cause: error.causeMessage,
					},
				};
			}

			return {
				status: "unhealthy",
				timestamp: new Date().toISOString(),
				error: error instanceof Error ? error.message : String(error),
			};
		}
	}
	private async checkDatabase() {
		try {
			await this.kysely
				.selectFrom("invoices")
				.select("invoiceId")
				.limit(1)
				.execute();
		} catch (error) {
			throw new HealthCheckDependencyError("database", error);
		}
	}
	private get kysely(): KyselyDatabase {
		return this._deps.kysely;
	}
}
