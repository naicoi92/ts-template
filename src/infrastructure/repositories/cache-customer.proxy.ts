import type { Customer } from "../../domain/entity";
import { CustomerNotFoundError } from "../../domain/error";
import type { CustomerRepository } from "../../domain/interface";
import type { CustomerCreateDto } from "../../domain/type";

export class CacheCustomerProxy implements CustomerRepository {
	customers: Map<string, Customer> = new Map();
	constructor(private target: CustomerRepository) {}
	async findByEmail(email: string): Promise<Customer> {
		if (this.customers.has(email)) return this.customers.get(email) as Customer;
		const customer = await this.target.findByEmail(email).catch((error) => {
			const isCustomerNotFoundError = error instanceof CustomerNotFoundError;
			if (!isCustomerNotFoundError) {
				throw error;
			}
			return this.create({ email });
		});
		this.customers.set(email, customer);
		return customer;
	}
	async create(data: CustomerCreateDto): Promise<Customer> {
		const customer = await this.target.create(data);
		this.customers.set(customer.email, customer);
		return customer;
	}
}
