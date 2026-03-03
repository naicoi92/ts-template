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
        test("should return data object", async () => {
            const invoiceData = invoiceFixtures.complete();
            const invoice = new Invoice(invoiceData);
            invoiceRepo.seedInvoice(invoice);

            const data = await handler.handle({
                params: { orderId: invoiceData.orderId! },
            });

            expect(data).toBeInstanceOf(Object);
            expect(data).toEqual({});
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
        
        test("should return empty data for complete invoice (paid or unpaid)", async () => {
            // complete invoice
            const invoiceData = invoiceFixtures.complete();
            const invoice = new Invoice(invoiceData);
            invoiceRepo.seedInvoice(invoice);

            const data1 = await handler.handle({
                params: { orderId: invoiceData.orderId! },
            });
            expect(data1).toEqual({});

            
            const paidInvoiceData = invoiceFixtures.paid();
            const paidInvoice = new Invoice(paidInvoiceData);
            invoiceRepo.seedInvoice(paidInvoice);
            const data2 = await handler.handle({
                params: { orderId: paidInvoiceData.orderId! },
            });
            expect(data2).toEqual({});
        });
    });
});
