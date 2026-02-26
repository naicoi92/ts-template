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
		this.logger.withData({ orderId }).debug("Finding invoice by orderId");

		const data = await this.kysely
			.selectFrom("invoices")
			.where("orderId", "=", orderId)
			.selectAll()
			.executeTakeFirstOrThrow()
			.catch((error) => {
				if (error instanceof NoResultError) {
					this.logger.withData({ orderId }).warn("Invoice not found");
					throw new InvoiceNotFoundError(orderId);
				}
				this.logger
					.withError(error)
					.withData({ orderId })
					.error("Failed to find invoice");
				throw error;
			});

		this.logger
			.withData({ orderId, invoiceId: data.invoiceId })
			.debug("Invoice found");

		return new Invoice(data);
	}
	async create(data: InvoiceCreateDto): Promise<Invoice> {
		this.logger
			.withData({ orderId: data.orderId, customerId: data.customerId })
			.debug("Creating invoice");

		const result = await this.kysely
			.insertInto("invoices")
			.values({
				customerId: data.customerId,
				code: data.code,
				orderId: data.orderId,
				amount: data.amount,
			})
			.returningAll()
			.executeTakeFirstOrThrow()
			.catch((error) => {
				this.logger
					.withError(error)
					.withData({ orderId: data.orderId })
					.error("Failed to create invoice");
				throw error;
			});

		this.logger
			.withData({ invoiceId: result.invoiceId, orderId: result.orderId })
			.info("Invoice created");

		return new Invoice(result);
	}
	private get kysely(): Kysely<Database> {
		return this._deps.kysely;
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
