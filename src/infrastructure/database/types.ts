import type { ColumnType, GeneratedAlways } from "kysely";

export type Customer = {
	id: GeneratedAlways<number>;
	email: string;
	createdAt: ColumnType<Date, string | undefined, never>;
	updatedAt: ColumnType<Date, string | undefined, never>;
};

export type Invoice = {
	id: GeneratedAlways<number>;
	customerId: number;
	orderId: string;
	amount: number;
	createdAt: ColumnType<Date, string | undefined, never>;
	updatedAt: ColumnType<Date, string | undefined, never>;
};

export type Database = {
	customers: Customer;
	invoices: Invoice;
};
