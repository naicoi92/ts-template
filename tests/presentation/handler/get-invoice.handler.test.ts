import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Invoice } from "../../../src/domain/entity";
import { GetInvoiceHandler } from "../../../src/presentation/handler/get-invoice.handler";
import { createMockInvoiceRepository, createMockLogger, resetAllMocks } from "../../mocks/index.ts";
import { invoiceFixtures } from "../../fixtures/index.ts";

describe("GetInvoiceHandler", () => {
	const logger = createMockLogger();
	const invoiceRepo = createMockInvoiceRepository();

	let handler: GetInvoiceHandler;

	beforeEach(() => {
		resetAllMocks(logger, invoiceRepo);

		handler = new GetInvoiceHandler({
			logger,
			invoiceRepository: invoiceRepo,
		});
	});

	afterEach(() => {
		resetAllMocks(logger, invoiceRepo);
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

	describe("handle", () => {
		test("should return data object", async () => {
			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			const data = await handler.handle({
				params: { orderId: invoiceData.orderId! },
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
			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			await handler.handle({
				params: { orderId: invoiceData.orderId! },
			});

			expect(logger.hasLog("info", "Initializing GetInvoiceUseCase")).toBe(true);
		});

		test("should log fetching invoice", async () => {
			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			await handler.handle({
				params: { orderId: invoiceData.orderId! },
			});

			expect(logger.hasLog("info", "Fetching invoice by orderId")).toBe(true);
		});

		test("should return invoice data for complete invoice (paid or unpaid)", async () => {
			// complete invoice
			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			const data1 = await handler.handle({
				params: { orderId: invoiceData.orderId! },
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
