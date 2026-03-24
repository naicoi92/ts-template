import { Partner } from "../../domain/entity";
import { PartnerNotFoundError } from "../../domain/error";
import type { PartnerRepository, Logger } from "../../domain/interface";
import { type Kysely, NoResultError } from "kysely";
import type { Database } from "../../infrastructure/database";

export class KyselyPartnerRepository implements PartnerRepository {
	constructor(private _deps: { kysely: Kysely<Database>; logger: Logger }) {
		this.logger.debug("KyselyPartnerRepository initialized");
	}

	async findByName(name: string): Promise<Partner> {
		this.logger.withData({ name }).debug("Finding partner by name");

		const data = await this.kysely
			.selectFrom("partners")
			.where("name", "=", name)
			.selectAll()
			.executeTakeFirstOrThrow()
			.catch((error: unknown) => {
				if (error instanceof NoResultError) {
					this.logger.withData({ name }).warn("Partner not found");
					throw new PartnerNotFoundError(name);
				}
				this.logger.withError(error as Error).withData({ name }).error("Failed to find partner");
				throw error;
			});

		this.logger.withData({ name, partnerId: data.partnerId }).debug("Partner found");

		return new Partner(data);
	}

	private get kysely(): Kysely<Database> {
		return this._deps.kysely;
	}

	private get logger(): Logger {
		return this._deps.logger;
	}
}
