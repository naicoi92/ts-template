import type { Invoice } from "../entity";
import type { InvoiceCreateDto, InvoiceCreateInternalDto } from "../type";

export interface InvoiceRepository {
	findByOrderId(orderId: string): Promise<Invoice>;
	create(data: InvoiceCreateInternalDto): Promise<Invoice>;
	save(data: InvoiceCreateDto): Promise<Invoice>;
}
