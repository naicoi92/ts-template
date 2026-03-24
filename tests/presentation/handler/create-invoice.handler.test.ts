import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Customer, Invoice } from "../../../src/domain/entity";
import { CreateInvoiceHandler } from "../../../src/presentation/handler/create-invoice.handler";
import {
	createMockCustomerRepository,
	createMockInvoiceCodeGenerator,
	createMockInvoiceRepository,
	createMockLogger,
	createMockPartnerRepository,
	createMockSignatureVerifier,
	resetAllMocks,
} from "../../mocks/index.ts";
import { invoiceFixtures, partnerFixtures } from "../../fixtures/index.ts";
import type { HeaderProvider } from "../../../src/domain/interface/header-provider.interface";
import { PartnerAuthenticationError } from "../../../src/domain/error";

class MockHeaderProvider implements HeaderProvider {
	private headers: Map<string, string> = new Map();

	setHeader(name: string, value: string | undefined): void {
		if (value !== undefined) {
			this.headers.set(name.toLowerCase(), value);
		}
	}

	get(name: string): string | null {
		return this.headers.get(name.toLowerCase()) ?? null;
	}

	has(name: string): boolean {
		return this.headers.has(name.toLowerCase());
	}

	clear(): void {
		this.headers.clear();
	}
}

describe("CreateInvoiceHandler", () => {
	const logger = createMockLogger();
	const invoiceRepo = createMockInvoiceRepository();
	const customerRepo = createMockCustomerRepository();
	const invoiceCodeGenerator = createMockInvoiceCodeGenerator();
	const partnerRepo = createMockPartnerRepository();
	const signatureVerifier = createMockSignatureVerifier();
	const headerProvider = new MockHeaderProvider();

	let handler: CreateInvoiceHandler;

	beforeEach(() => {
		resetAllMocks(logger, invoiceRepo, customerRepo, invoiceCodeGenerator, partnerRepo, signatureVerifier);
		headerProvider.clear();

		handler = new CreateInvoiceHandler({
			logger,
			invoiceRepository: invoiceRepo,
			customerRepository: customerRepo,
			invoiceCodeGenerator,
			partnerRepository: partnerRepo,
			signatureVerifier,
		});
	});

	afterEach(() => {
		resetAllMocks(logger, invoiceRepo, customerRepo, invoiceCodeGenerator, partnerRepo, signatureVerifier);
	});

	describe("handler metadata", () => {
		test("should have correct pathname", () => {
			expect(handler.pathname).toBe("/invoices");
		});

		test("should have correct method", () => {
			expect(handler.method).toBe("POST");
		});

		test("should have bodySchema defined", () => {
			expect(handler.bodySchema).toBeDefined();
		});
	});

	describe("auth validation", () => {
		const validBody = {
			email: "test@example.com",
			orderId: "ORDER-001",
			amount: 100000,
		};

		test("1. missing x-partner-name header returns 401", async () => {
			headerProvider.setHeader("x-signature", "some-signature");

			await expect(
				handler.handle({
					params: undefined as never,
					query: undefined as never,
					body: validBody,
					headers: headerProvider,
				}),
			).rejects.toThrow(PartnerAuthenticationError);
		});

		test("2. missing x-signature header returns 401", async () => {
			headerProvider.setHeader("x-partner-name", "partner-abc");

			await expect(
				handler.handle({
					params: undefined as never,
					query: undefined as never,
					body: validBody,
					headers: headerProvider,
				}),
			).rejects.toThrow(PartnerAuthenticationError);
		});

		test("3. missing both headers returns 401", async () => {
			await expect(
				handler.handle({
					params: undefined as never,
					query: undefined as never,
					body: validBody,
					headers: headerProvider,
				}),
			).rejects.toThrow(PartnerAuthenticationError);
		});

		test("4. invalid signature returns 401", async () => {
			const partner = partnerFixtures.valid();
			partnerRepo.seedPartner(partner);
			signatureVerifier.setDefaultValid(false);

			headerProvider.setHeader("x-partner-name", partner.name);
			headerProvider.setHeader("x-signature", "invalid-signature");

			await expect(
				handler.handle({
					params: undefined as never,
					query: undefined as never,
					body: validBody,
					headers: headerProvider,
				}),
			).rejects.toThrow(PartnerAuthenticationError);
		});

		test("5. unknown partner returns 401", async () => {
			signatureVerifier.setDefaultValid(true);

			headerProvider.setHeader("x-partner-name", "unknown-partner");
			headerProvider.setHeader("x-signature", "some-signature");

			await expect(
				handler.handle({
					params: undefined as never,
					query: undefined as never,
					body: validBody,
					headers: headerProvider,
				}),
			).rejects.toThrow(PartnerAuthenticationError);
		});

		test("6. valid auth continues to business logic", async () => {
			const partner = partnerFixtures.valid();
			partnerRepo.seedPartner(partner);
			signatureVerifier.setDefaultValid(true);

			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			const customer = new Customer({
				customerId: invoiceData.customerId!,
				email: validBody.email,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			customerRepo.seedCustomer(customer);

			headerProvider.setHeader("x-partner-name", partner.name);
			headerProvider.setHeader("x-signature", "valid-signature");

			const result = await handler.handle({
				params: undefined as never,
				query: undefined as never,
				body: validBody,
				headers: headerProvider,
			});

			expect(result).toBeDefined();
			expect(result.orderId).toBe(invoiceData.orderId!);
			expect(result.code).toBe(invoiceData.code!);
			expect(result.amount).toBe(invoiceData.amount!);
		});

		test("7. valid auth with seeded signature continues to business logic", async () => {
			const partner = partnerFixtures.valid();
			if (!partner.token) {
				throw new Error("partner token is required for seeded signature test");
			}
			partnerRepo.seedPartner(partner);

			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			const customer = new Customer({
				customerId: invoiceData.customerId!,
				email: validBody.email,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
			customerRepo.seedCustomer(customer);

			const signature = "seeded-signature";
			signatureVerifier.seedSignature({
				token: partner.token,
				signature,
				request: {
					method: "POST",
					pathname: "/invoices",
					data: validBody,
				},
			});

			headerProvider.setHeader("x-partner-name", partner.name);
			headerProvider.setHeader("x-signature", signature);

			const result = await handler.handle({
				params: undefined as never,
				query: undefined as never,
				body: validBody,
				headers: headerProvider,
			});

			expect(result).toBeDefined();
			expect(result.orderId).toBe(invoiceData.orderId!);
		});
	});
});
