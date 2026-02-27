import type { Kysely } from "kysely";
import type { HealthCheckService } from "../../domain/interface";
import type { HealthStatus } from "../../domain/type";
import type { Database } from "../database/types";

/**
 * Database Health Check Service
 *
 * Checks database connectivity and health status
 */
export class DatabaseHealthCheckService implements HealthCheckService {
	constructor(private readonly _kysely: Kysely<Database>) {}

	async check(): Promise<HealthStatus> {
		try {
			// Simple query to check database connectivity
			await this._kysely
				.selectFrom("invoices")
				.select("invoiceId")
				.limit(1)
				.execute();

			return {
				status: "healthy",
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			return {
				status: "unhealthy",
				timestamp: new Date().toISOString(),
				error:
					error instanceof Error ? error.message : "Database connection failed",
			};
		}
	}
}
