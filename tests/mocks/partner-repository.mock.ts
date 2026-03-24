import { Partner } from "../../src/domain/entity/partner.entity";
import { PartnerNotFoundError } from "../../src/domain/error/partner.error";
import type { PartnerSelectDto } from "../../src/domain/type";
import type { PartnerRepository } from "../../src/domain/interface/partner-repository.interface";

export class MockPartnerRepository implements PartnerRepository {
	private partners: Map<string, Partner> = new Map();

	async findByName(name: string): Promise<Partner> {
		const partner = this.partners.get(name);
		if (!partner) throw new PartnerNotFoundError(name);
		return partner;
	}

	reset(): void {
		this.partners.clear();
	}

	seedPartner(dto: PartnerSelectDto): void {
		this.partners.set(dto.name ?? "", new Partner(dto));
	}
}

export function createMockPartnerRepository(): MockPartnerRepository {
	return new MockPartnerRepository();
}
