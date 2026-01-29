import { PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Config, Logger } from "../../domain/interface";

export class KyselyPostgresDialect extends PostgresDialect {
	constructor(readonly _deps: { config: Config; logger: Logger }) {
		super({
			pool: new Pool({
				application_name: _deps.config.name,
				connectionString: _deps.config.database.url,
				idleTimeoutMillis: 30000,
				max: 5,
			}),
		});
		this.logger.debug("KyselyPostgresDialect initialized");
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
