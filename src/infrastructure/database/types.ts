import type { ColumnType, GeneratedAlways } from "kysely";
import type { InvoiceStatus } from "../../domain/enum";

export type Customer = {
	customerId: GeneratedAlways<number>;
	email: string;
	createdAt: ColumnType<Date, string | undefined, never>;
	updatedAt: ColumnType<Date, string | undefined, never>;
};

export type Invoice = {
	invoiceId: GeneratedAlways<number>;
	code: string;
	customerId: number;
	orderId: string;
	amount: number;
	status: GeneratedAlways<InvoiceStatus>;
	createdAt: ColumnType<Date, string | undefined, never>;
	updatedAt: ColumnType<Date, string | undefined, never>;
};

export type Partner = {
	partnerId: GeneratedAlways<number>;
	name: string;
	token: string;
};

export type Database = {
	customers: Customer;
	invoices: Invoice;
	partners: Partner;
};
