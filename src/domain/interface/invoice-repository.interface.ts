import type { Invoice } from "../entity";
import type { InvoiceCreateDto } from "../type";

export interface InvoiceRepository {
  findByOrderId(orderId: string): Promise<Invoice>;
  create(data: InvoiceCreateDto): Promise<Invoice>;
}
