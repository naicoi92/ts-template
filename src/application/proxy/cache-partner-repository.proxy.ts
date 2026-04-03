import type { Partner } from "../../domain/entity";
import type { PartnerRepository } from "../../domain/interface";

export class CachePartnerRepositoryProxy implements PartnerRepository {
	partners: Map<string, Partner> = new Map();
	constructor(private target: PartnerRepository) {}
	async findByName(name: string): Promise<Partner> {
		if (this.partners.has(name)) return this.partners.get(name) as Partner;
		const partner = await this.target.findByName(name);
		this.partners.set(name, partner);
		return partner;
	}
}
