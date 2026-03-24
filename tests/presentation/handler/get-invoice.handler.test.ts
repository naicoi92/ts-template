import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Invoice } from "../../../src/domain/entity";
import { GetInvoiceHandler } from "../../../src/presentation/handler/get-invoice.handler";
import {
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

describe("GetInvoiceHandler", () => {
	const logger = createMockLogger();
	const invoiceRepo = createMockInvoiceRepository();
	const partnerRepo = createMockPartnerRepository();
	const signatureVerifier = createMockSignatureVerifier();
	const headerProvider = new MockHeaderProvider();

	let handler: GetInvoiceHandler;

	beforeEach(() => {
		resetAllMocks(logger, invoiceRepo, undefined, undefined, partnerRepo, signatureVerifier);
		headerProvider.clear();

		handler = new GetInvoiceHandler({
			logger,
			invoiceRepository: invoiceRepo,
			partnerRepository: partnerRepo,
			signatureVerifier,
		});
	});

	afterEach(() => {
		resetAllMocks(logger, invoiceRepo, undefined, undefined, partnerRepo, signatureVerifier);
	});

	describe("handler metadata", () => {
		test("should have correct pathname", () => {
			expect(handler.pathname).toBe("/invoices/:orderId");
		});

		test("should have correct method", () => {
			expect(handler.method).toBe("GET");
		});

		test("should have paramsSchema defined", () => {
			expect(handler.paramsSchema).toBeDefined();
		});
	});

	describe("auth validation", () => {
		const orderId = "ORDER-001";

		test("1. missing x-partner-name header returns 401", async () => {
			headerProvider.setHeader("x-signature", "some-signature");

			await expect(
				handler.handle({
					params: { orderId },
					query: undefined as never,
					body: undefined as never,
					headers: headerProvider,
				}),
			).rejects.toThrow(PartnerAuthenticationError);
		});

		test("2. missing x-signature header returns 401", async () => {
			headerProvider.setHeader("x-partner-name", "partner-abc");

			await expect(
				handler.handle({
					params: { orderId },
					query: undefined as never,
					body: undefined as never,
					headers: headerProvider,
				}),
			).rejects.toThrow(PartnerAuthenticationError);
		});

		test("3. missing both headers returns 401", async () => {
			await expect(
				handler.handle({
					params: { orderId },
					query: undefined as never,
					body: undefined as never,
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
					params: { orderId },
					query: undefined as never,
					body: undefined as never,
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
					params: { orderId },
					query: undefined as never,
					body: undefined as never,
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

			headerProvider.setHeader("x-partner-name", partner.name);
			headerProvider.setHeader("x-signature", "valid-signature");

			const result = await handler.handle({
				params: { orderId: invoiceData.orderId! },
				query: undefined as never,
				body: undefined as never,
				headers: headerProvider,
			});

			expect(result).toBeInstanceOf(Object);
			expect(result.orderId).toBe(invoiceData.orderId!);
			expect(result.invoiceId).toBe(invoiceData.invoiceId!);
			expect(result.code).toBe(invoiceData.code!);
			expect(result.amount).toBe(invoiceData.amount!);
			expect(result.status).toBe(invoiceData.status!);
		});
	});

	describe("handle", () => {
		test("should return data object", async () => {
			const partner = partnerFixtures.valid();
			partnerRepo.seedPartner(partner);
			signatureVerifier.setDefaultValid(true);

			headerProvider.setHeader("x-partner-name", partner.name);
			headerProvider.setHeader("x-signature", "valid-signature");

			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			const data = await handler.handle({
				params: { orderId: invoiceData.orderId! },
				query: undefined as never,
				body: undefined as never,
				headers: headerProvider,
			});

			expect(data).toBeInstanceOf(Object);
			expect(data).toEqual({
				orderId: invoiceData.orderId!,
				invoiceId: invoiceData.invoiceId!,
				code: invoiceData.code!,
				amount: invoiceData.amount!,
				status: invoiceData.status!,
			});
		});

		test("should log use case initialization", async () => {
			const partner = partnerFixtures.valid();
			partnerRepo.seedPartner(partner);
			signatureVerifier.setDefaultValid(true);

			headerProvider.setHeader("x-partner-name", partner.name);
			headerProvider.setHeader("x-signature", "valid-signature");

			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			await handler.handle({
				params: { orderId: invoiceData.orderId! },
				query: undefined as never,
				body: undefined as never,
				headers: headerProvider,
			});

			expect(logger.hasLog("info", "Initializing GetInvoiceUseCase")).toBe(true);
		});

		test("should log fetching invoice", async () => {
			const partner = partnerFixtures.valid();
			partnerRepo.seedPartner(partner);
			signatureVerifier.setDefaultValid(true);

			headerProvider.setHeader("x-partner-name", partner.name);
			headerProvider.setHeader("x-signature", "valid-signature");

			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			await handler.handle({
				params: { orderId: invoiceData.orderId! },
				query: undefined as never,
				body: undefined as never,
				headers: headerProvider,
			});

			expect(logger.hasLog("info", "Fetching invoice by orderId")).toBe(true);
		});

		test("should return invoice data for complete invoice (paid or unpaid)", async () => {
			const partner = partnerFixtures.valid();
			partnerRepo.seedPartner(partner);
			signatureVerifier.setDefaultValid(true);

			headerProvider.setHeader("x-partner-name", partner.name);
			headerProvider.setHeader("x-signature", "valid-signature");

			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			const data1 = await handler.handle({
				params: { orderId: invoiceData.orderId! },
				query: undefined as never,
				body: undefined as never,
				headers: headerProvider,
			});
			expect(data1).toEqual({
				orderId: invoiceData.orderId!,
				invoiceId: invoiceData.invoiceId!,
				code: invoiceData.code!,
				amount: invoiceData.amount!,
				status: invoiceData.status!,
			});

			const paidInvoiceData = invoiceFixtures.paid();
			const paidInvoice = new Invoice(paidInvoiceData);
			invoiceRepo.seedInvoice(paidInvoice);
			const data2 = await handler.handle({
				params: { orderId: paidInvoiceData.orderId! },
				query: undefined as never,
				body: undefined as never,
				headers: headerProvider,
			});
			expect(data2).toEqual({
				orderId: paidInvoiceData.orderId!,
				invoiceId: paidInvoiceData.invoiceId!,
				code: paidInvoiceData.code!,
				amount: paidInvoiceData.amount!,
				status: paidInvoiceData.status!,
			});
		});
	});
});
