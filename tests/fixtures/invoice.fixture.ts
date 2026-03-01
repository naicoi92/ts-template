import { InvoiceStatus } from "../../src/domain/enum";
import type { InvoiceSelectDto } from "../../src/domain/type";

export const invoiceFixtures = {
	complete: (): InvoiceSelectDto => ({
		invoiceId: 1,
		code: "INV-2024-001",
		customerId: 1,
		email: "customer@example.com",
		orderId: "ORDER-001",
		amount: 100000,
		status: InvoiceStatus.PENDING,
		createdAt: new Date("2024-01-15T10:00:00Z"),
		updatedAt: new Date("2024-01-15T10:00:00Z"),
	}),

	paid: (): InvoiceSelectDto => ({
		invoiceId: 2,
		code: "INV-2024-002",
		customerId: 1,
		email: "customer@example.com",
		orderId: "ORDER-002",
		amount: 250000,
		status: InvoiceStatus.PAID,
		createdAt: new Date("2024-01-14T10:00:00Z"),
		updatedAt: new Date("2024-01-14T12:30:00Z"),
	}),

	minimal: (): InvoiceSelectDto => ({
		orderId: "ORDER-MINIMAL",
		email: "minimal@example.com",
		amount: 50000,
	}),
};

export const invoiceCreateFixtures = {
	valid: () => ({
		code: "INV-NEW-001",
		customerId: 1,
		email: "new@example.com",
		orderId: "ORDER-NEW",
		amount: 75000,
	}),
};
