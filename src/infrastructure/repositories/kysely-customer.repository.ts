import { type Kysely, NoResultError } from "kysely";
import { Customer } from "../../domain/entity";
import { CustomerNotFoundError } from "../../domain/error";
import type { CustomerRepository, Logger } from "../../domain/interface";
import type { CustomerCreateDto } from "../../domain/type";
import type { Database } from "../../infrastructure/database";

export class KyselyCustomerRepository implements CustomerRepository {
	constructor(private _deps: { kysely: Kysely<Database>; logger: Logger }) {
		this.logger.debug("KyselyCustomerRepository initialized");
	}
	async findByEmail(email: string): Promise<Customer> {
		this.logger.withData({ email }).debug("Finding customer by email");

		const data = await this.kysely
			.selectFrom("customers")
			.where("email", "=", email)
			.selectAll()
			.executeTakeFirstOrThrow()
			.catch((error) => {
				if (error instanceof NoResultError) {
					this.logger.withData({ email }).warn("Customer not found");
					throw new CustomerNotFoundError(email);
				}
				this.logger
					.withError(error)
					.withData({ email })
					.error("Failed to find customer");
				throw error;
			});

		this.logger
			.withData({ email, customerId: data.customerId })
			.debug("Customer found");

		return new Customer(data);
	}
	async create(data: CustomerCreateDto): Promise<Customer> {
		this.logger.withData({ email: data.email }).debug("Creating customer");

		const result = await this.kysely
			.insertInto("customers")
			.values({
				email: data.email,
			})
			.returningAll()
			.executeTakeFirstOrThrow()
			.catch((error) => {
				this.logger
					.withError(error)
					.withData({ email: data.email })
					.error("Failed to create customer");
				throw error;
			});

		this.logger
			.withData({ customerId: result.customerId, email: result.email })
			.info("Customer created");

		return new Customer(result);
	}
	async findOrCreateByEmail(email: string): Promise<Customer> {
		this.logger.withData({ email }).debug("Finding or creating customer");

		try {
			const customer = await this.findByEmail(email);
			this.logger
				.withData({ email, customerId: customer.id })
				.debug("Existing customer found");
			return customer;
		} catch (error) {
			const isNotFoundError = error instanceof CustomerNotFoundError;
			if (!isNotFoundError) {
				this.logger
					.withError(error as Error)
					.withData({ email })
					.error("Unexpected error finding customer");
				throw error;
			}
			this.logger.withData({ email }).info("Creating new customer");
			return await this.create({ email });
		}
	}
	private get kysely(): Kysely<Database> {
		return this._deps.kysely;
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
