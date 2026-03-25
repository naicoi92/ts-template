import type { CustomerRepository } from "../../domain/interface";
import { CacheCustomerProxy } from "../repositories/cache-customer.proxy";

export class CachedCustomerRepositoryFactory {
	create(customerRepository: CustomerRepository): CustomerRepository {
		return new CacheCustomerProxy({ customerRepository });
	}
}
