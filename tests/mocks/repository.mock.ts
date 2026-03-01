import type { Customer, Invoice } from "../../src/domain/entity";
import type { CustomerRepository, InvoiceRepository } from "../../src/domain/interface";
import type { CustomerCreateDto, InvoiceCreateDto } from "../../src/domain/type";
import { InvoiceNotFoundError } from "../../src/domain/error";
import { InvoiceStatus } from "../../src/domain/enum";

export class MockInvoiceRepository implements InvoiceRepository {
	private invoices: Map<string, Invoice> = new Map();
	private nextId = 1;

	async findByOrderId(orderId: string): Promise<Invoice> {
		const invoice = this.invoices.get(orderId);
		if (!invoice) {
			throw new InvoiceNotFoundError(orderId);
		}
		return invoice;
	}

	async create(data: InvoiceCreateDto): Promise<Invoice> {
		const invoiceId = this.nextId++;
		const now = new Date();
		const invoiceData = {
			invoiceId,
			code: data.code,
			customerId: data.customerId,
			email: data.email,
			orderId: data.orderId,
			amount: data.amount,
			status: InvoiceStatus.PENDING,
			createdAt: now,
			updatedAt: now,
		};
		const { Invoice } = await import("../../src/domain/entity");
		const invoice = new Invoice(invoiceData);
		this.invoices.set(data.orderId, invoice);
		return invoice;
	}

	reset(): void {
		this.invoices.clear();
		this.nextId = 1;
	}

	seedInvoice(invoice: Invoice): void {
		this.invoices.set(invoice.orderId, invoice);
	}

	getAllInvoices(): Invoice[] {
		return Array.from(this.invoices.values());
	}
}

export class MockCustomerRepository implements CustomerRepository {
	private customers: Map<string, Customer> = new Map();
	private nextId = 1;

	async findByEmail(email: string): Promise<Customer> {
		const customer = this.customers.get(email);
		if (!customer) {
			throw new Error(`Customer not found: ${email}`);
		}
		return customer;
	}

	async create(data: CustomerCreateDto): Promise<Customer> {
		const customerId = this.nextId++;
		const now = new Date();
		const customerData = {
			customerId,
			email: data.email,
			createdAt: now,
			updatedAt: now,
		};
		const { Customer } = await import("../../src/domain/entity");
		const customer = new Customer(customerData);
		this.customers.set(data.email, customer);
		return customer;
	}

	async findOrCreateByEmail(email: string): Promise<Customer> {
		const existing = this.customers.get(email);
		if (existing) return existing;
		return this.create({ email });
	}

	reset(): void {
		this.customers.clear();
		this.nextId = 1;
	}

	seedCustomer(customer: Customer): void {
		this.customers.set(customer.email, customer);
	}

	getAllCustomers(): Customer[] {
		return Array.from(this.customers.values());
	}
}

export function createMockInvoiceRepository(): MockInvoiceRepository {
	return new MockInvoiceRepository();
}

export function createMockCustomerRepository(): MockCustomerRepository {
	return new MockCustomerRepository();
}
