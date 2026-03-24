import type { PartnerCredential } from "../type";

export interface PartnerRepository {
	findByName(name: string): Promise<PartnerCredential | null>;
}
