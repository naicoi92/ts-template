import type { Partner } from "../entity/partner.entity";

export interface PartnerRepository {
	/**
	 * Tìm partner theo tên.
	 * @throws {PartnerNotFoundError} nếu không tìm thấy partner.
	 */
	findByName(name: string): Promise<Partner>;
}
