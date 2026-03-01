import { describe, expect, test } from "bun:test";
import { InvoiceStatus } from "../../../src/domain/enum";
import { InvoiceFieldNotFoundError } from "../../../src/domain/error";
import { Invoice } from "../../../src/domain/entity";
import { invoiceFixtures } from "../../fixtures/index.ts";

describe("Invoice Entity", () => {
	describe("constructor", () => {
		test("should create invoice with complete data", () => {
			const data = invoiceFixtures.complete();
			const invoice = new Invoice(data);

			expect(invoice).toBeDefined();
		});

		test("should create invoice with partial data", () => {
			const data = invoiceFixtures.minimal();
			const invoice = new Invoice(data);

			expect(invoice).toBeDefined();
		});
	});

	describe("getters", () => {
		test("should return invoiceId when present", () => {
			const data = invoiceFixtures.complete();
			const invoice = new Invoice(data);

			expect(invoice.invoiceId).toBe(1);
		});

		test("should throw InvoiceFieldNotFoundError when invoiceId is missing", () => {
			const data = invoiceFixtures.minimal();
			const invoice = new Invoice(data);

			expect(() => invoice.invoiceId).toThrow(InvoiceFieldNotFoundError);
		});

		test("should return code when present", () => {
			const data = invoiceFixtures.complete();
			const invoice = new Invoice(data);

			expect(invoice.code).toBe("INV-2024-001");
		});

		test("should throw InvoiceFieldNotFoundError when code is missing", () => {
			const data = invoiceFixtures.minimal();
			const invoice = new Invoice(data);

			expect(() => invoice.code).toThrow(InvoiceFieldNotFoundError);
		});

		test("should return email when present", () => {
			const data = invoiceFixtures.complete();
			const invoice = new Invoice(data);

			expect(invoice.email).toBe("customer@example.com");
		});

		test("should return orderId when present", () => {
			const data = invoiceFixtures.complete();
			const invoice = new Invoice(data);

			expect(invoice.orderId).toBe("ORDER-001");
		});

		test("should return amount when present", () => {
			const data = invoiceFixtures.complete();
			const invoice = new Invoice(data);

			expect(invoice.amount).toBe(100000);
		});

		test("should return customerId when present", () => {
			const data = invoiceFixtures.complete();
			const invoice = new Invoice(data);

			expect(invoice.customerId).toBe(1);
		});

		test("should return createdAt when present", () => {
			const data = invoiceFixtures.complete();
			const invoice = new Invoice(data);

			expect(invoice.createdAt).toBeInstanceOf(Date);
		});

		test("should return updatedAt when present", () => {
			const data = invoiceFixtures.complete();
			const invoice = new Invoice(data);

			expect(invoice.updatedAt).toBeInstanceOf(Date);
		});

		test("should return status when present", () => {
			const data = invoiceFixtures.complete();
			const invoice = new Invoice(data);

			expect(invoice.status).toBe(InvoiceStatus.PENDING);
		});
	});

	describe("isPaid", () => {
		test("should return true when status is PAID", () => {
			const data = invoiceFixtures.paid();
			const invoice = new Invoice(data);

			expect(invoice.isPaid).toBe(true);
		});

		test("should return false when status is PENDING", () => {
			const data = invoiceFixtures.complete();
			const invoice = new Invoice(data);

			expect(invoice.isPaid).toBe(false);
		});
	});

	describe("isAmountMatch", () => {
		test("should return true when amounts match", () => {
			const data = invoiceFixtures.complete();
			const invoice = new Invoice(data);

			expect(invoice.isAmountMatch(100000)).toBe(true);
		});

		test("should return false when amounts do not match", () => {
			const data = invoiceFixtures.complete();
			const invoice = new Invoice(data);

			expect(invoice.isAmountMatch(99999)).toBe(false);
		});

		test("should return false for different amount", () => {
			const data = invoiceFixtures.paid();
			const invoice = new Invoice(data);

			expect(invoice.isAmountMatch(100000)).toBe(false);
		});
	});
});
