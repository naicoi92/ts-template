import type { Config } from "../../domain/interface";
import type { PartnerCredential } from "../../domain/type";
import type { PartnerRepository } from "../../domain/interface/partner-repository.interface";

export class StaticPartnerRepository implements PartnerRepository {
	constructor(private readonly _deps: { config: Config }) {}

	async findByName(name: string): Promise<PartnerCredential | null> {
		const credentials = this._deps.config.partnerCredentials;
		return credentials.find((c) => c.name === name) ?? null;
	}
}
