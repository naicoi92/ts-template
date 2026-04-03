import type { Invoice } from "../../domain/entity";
import type { InvoiceRepository } from "../../domain/interface";
import type { InvoiceCreateDto } from "../../domain/type";

export class CacheInvoiceRepositoryProxy implements InvoiceRepository {
	orders: Map<string, Invoice> = new Map();
	constructor(private target: InvoiceRepository) {}
	async findByOrderId(orderId: string): Promise<Invoice> {
		if (this.orders.has(orderId)) return this.orders.get(orderId) as Invoice;
		const invoice = await this.target.findByOrderId(orderId);
		this.orders.set(orderId, invoice);
		return invoice;
	}
	async create(data: InvoiceCreateDto): Promise<Invoice> {
		const invoice = await this.target.create(data);
		this.orders.set(invoice.orderId, invoice);
		return invoice;
	}
}
