import { Kysely, type RawBuilder, sql } from "kysely";
import type { Config, Logger } from "../../domain/interface";
import { KyselyPostgresDialect } from "./dialect";
import type { Database } from "./types";

export class KyselyDatabase extends Kysely<Database> {
	constructor(readonly _deps: { config: Config; logger: Logger }) {
		const dialect = new KyselyPostgresDialect({
			config: _deps.config,
			logger: _deps.logger,
		});
		super({
			dialect,
			log: ["error", "query"],
		});
		this.logger.debug("KyselyDatabase initialized");
	}
	toJsonb = <T>(value: T): RawBuilder<T> => {
		return sql`CAST(${JSON.stringify(value)} AS JSONB)`;
	};
	private get logger(): Logger {
		return this._deps.logger;
	}
}
