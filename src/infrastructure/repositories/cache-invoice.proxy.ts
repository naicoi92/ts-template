import type { Invoice } from "../../domain/entity";
import type { InvoiceRepository } from "../../domain/interface";
import type { InvoiceCreateDto } from "../../domain/type";

export class CacheInvoiceProxy implements InvoiceRepository {
	orders: Map<string, Invoice> = new Map();
	constructor(private deps: { invoiceRepository: InvoiceRepository }) {}
	async findByOrderId(orderId: string): Promise<Invoice> {
		if (this.orders.has(orderId)) return this.orders.get(orderId) as Invoice;
		const invoice = await this.invoiceRepository.findByOrderId(orderId);
		this.orders.set(orderId, invoice);
		return invoice;
	}
	async create(data: InvoiceCreateDto): Promise<Invoice> {
		const invoice = await this.invoiceRepository.create(data);
		this.orders.set(invoice.orderId, invoice);
		return invoice;
	}

	private get invoiceRepository(): InvoiceRepository {
		return this.deps.invoiceRepository;
	}
}
