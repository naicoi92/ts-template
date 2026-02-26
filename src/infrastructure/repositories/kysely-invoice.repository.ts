import { type Kysely, NoResultError } from "kysely";
import { Invoice } from "../../domain/entity";
import { InvoiceNotFoundError } from "../../domain/error";
import type { InvoiceRepository, Logger } from "../../domain/interface";
import type { InvoiceCreateDto } from "../../domain/type";
import type { Database } from "../../infrastructure/database";

export class KyselyInvoiceRepository implements InvoiceRepository {
	constructor(private _deps: { kysely: Kysely<Database>; logger: Logger }) {
		this.logger.debug("KyselyInvoiceRepository initialized");
	}
	async findByOrderId(orderId: string): Promise<Invoice> {
		const data = await this.kysely
			.selectFrom("invoices")
			.where("orderId", "=", orderId)
			.selectAll()
			.executeTakeFirstOrThrow()
			.catch((error) => {
				if (error instanceof NoResultError)
					throw new InvoiceNotFoundError(orderId);
				throw error;
			});
		return new Invoice(data);
	}
	async create(data: InvoiceCreateDto): Promise<Invoice> {
		const result = await this.kysely
			.insertInto("invoices")
			.values({
				customerId: data.customerId,
				code: data.code,
				orderId: data.orderId,
				amount: data.amount,
			})
			.returningAll()
			.executeTakeFirstOrThrow();
		return new Invoice(result);
	}
	private get kysely(): Kysely<Database> {
		return this._deps.kysely;
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
