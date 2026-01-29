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
		const data = await this.kysely
			.selectFrom("customers")
			.where("email", "=", email)
			.selectAll()
			.executeTakeFirstOrThrow()
			.catch((error) => {
				if (error instanceof NoResultError)
					throw new CustomerNotFoundError(email);
				return error;
			});
		return new Customer(data);
	}
	async create(data: CustomerCreateDto): Promise<Customer> {
		const result = await this.kysely
			.insertInto("customers")
			.values({
				email: data.email,
			})
			.returningAll()
			.executeTakeFirstOrThrow();
		return new Customer(result);
	}
	async findOrCreateByEmail(email: string): Promise<Customer> {
		try {
			return await this.findByEmail(email);
		} catch (error) {
			const isNotFoundError = error instanceof CustomerNotFoundError;
			if (!isNotFoundError) throw error;
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
