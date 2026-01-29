import type { Customer } from "../entity";
import type { CustomerCreateDto } from "../type";

export interface CustomerRepository {
	findByEmail(email: string): Promise<Customer>;
	create(data: CustomerCreateDto): Promise<Customer>;
	findOrCreateByEmail(email: string): Promise<Customer>;
}
