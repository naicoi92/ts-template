import type { PartnerCredential } from "../../src/domain/type";
import type { PartnerRepository } from "../../src/domain/interface/partner-repository.interface";

export class MockPartnerRepository implements PartnerRepository {
	private partners: Map<string, PartnerCredential> = new Map();

	async findByName(name: string): Promise<PartnerCredential | null> {
		return this.partners.get(name) ?? null;
	}

	reset(): void {
		this.partners.clear();
	}

	seedPartner(partner: PartnerCredential): void {
		this.partners.set(partner.name, partner);
	}

	getAllPartners(): PartnerCredential[] {
		return Array.from(this.partners.values());
	}
}

export function createMockPartnerRepository(): MockPartnerRepository {
	return new MockPartnerRepository();
}
