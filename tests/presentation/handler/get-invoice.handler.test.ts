import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Invoice } from "../../../src/domain/entity";
import { GetInvoiceUseCase } from "../../../src/application/use-case/get-invoice.use-case";
import { GetInvoiceHandler } from "../../../src/presentation/handler/get-invoice.handler";
import {
	createMockCustomerRepository,
	createMockInvoiceCodeGenerator,
	createMockInvoiceRepository,
	createMockLogger,
	resetAllMocks,
} from "../../mocks/index.ts";
import { invoiceFixtures } from "../../fixtures/index.ts";

describe("GetInvoiceHandler", () => {
	const logger = createMockLogger();
	const invoiceRepo = createMockInvoiceRepository();
	const customerRepo = createMockCustomerRepository();
	const codeGenerator = createMockInvoiceCodeGenerator();

	let useCase: GetInvoiceUseCase;
	let handler: GetInvoiceHandler;

	beforeEach(() => {
		resetAllMocks(logger, invoiceRepo, customerRepo, codeGenerator);

		useCase = new GetInvoiceUseCase({
			logger,
			invoiceRepository: invoiceRepo,
		});

		handler = new GetInvoiceHandler({
			getInvoiceUseCase: useCase,
			logger,
		});
	});

	afterEach(() => {
		resetAllMocks(logger, invoiceRepo, customerRepo, codeGenerator);
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
		test("should return invoice and 200 response", async () => {
			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			const response = await handler.handle({
				params: { orderId: invoiceData.orderId! },
			});
			const json = (await response.json()) as { success: boolean; data: { invoiceId: number; orderId: string } };

			expect(response.status).toBe(200);
			expect(json.success).toBe(true);
			expect(json.data.invoiceId).toBe(invoiceData.invoiceId!);
			expect(json.data.orderId).toBe(invoiceData.orderId!);
		});

		test("should log processing request", async () => {
			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			await handler.handle({
				params: { orderId: invoiceData.orderId! },
			});

			expect(logger.hasLog("info", "Processing get invoice request")).toBe(true);
		});

		test("should log successful retrieval", async () => {
			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			await handler.handle({
				params: { orderId: invoiceData.orderId! },
			});

			expect(logger.hasLog("info", "Invoice retrieved successfully")).toBe(true);
		});

		test("should return correct response format", async () => {
			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			const response = await handler.handle({
				params: { orderId: invoiceData.orderId! },
			});
			const json = (await response.json()) as {
				success: boolean
				data: {
					invoiceId: number
					orderId: string
					amount: number
					status: string
					isPaid: boolean
				}
			};

			expect(json.success).toBe(true);
			expect(json.data).toMatchObject({
				invoiceId: invoiceData.invoiceId,
				orderId: invoiceData.orderId,
				amount: invoiceData.amount,
				status: invoiceData.status,
				isPaid: false,
			});
		});

		test("should return isPaid true for paid invoice", async () => {
			const invoiceData = invoiceFixtures.paid();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			const response = await handler.handle({
				params: { orderId: invoiceData.orderId! },
			});
			const json = (await response.json()) as { success: boolean; data: { isPaid: boolean } };

			expect(json.success).toBe(true);
			expect(json.data.isPaid).toBe(true);
		});
	});
});
