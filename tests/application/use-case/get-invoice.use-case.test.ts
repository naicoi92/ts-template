import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Invoice } from "../../../src/domain/entity";
import { InvoiceNotFoundError } from "../../../src/domain/error";
import { GetInvoiceUseCase } from "../../../src/application/use-case/get-invoice.use-case";
import {
	createMockInvoiceRepository,
	createMockLogger,
	resetAllMocks,
} from "../../mocks/index.ts";
import { createMockCustomerRepository, createMockInvoiceCodeGenerator } from "../../mocks/index.ts";
import { invoiceFixtures } from "../../fixtures";

describe("GetInvoiceUseCase", () => {
	const logger = createMockLogger();
	const invoiceRepo = createMockInvoiceRepository();
	const customerRepo = createMockCustomerRepository();
	const codeGenerator = createMockInvoiceCodeGenerator();

	let useCase: GetInvoiceUseCase;

	beforeEach(() => {
		resetAllMocks(logger, invoiceRepo, customerRepo, codeGenerator);
		useCase = new GetInvoiceUseCase({
			logger,
			invoiceRepository: invoiceRepo,
		});
	});

	afterEach(() => {
		resetAllMocks(logger, invoiceRepo, customerRepo, codeGenerator);
	});

	describe("execute", () => {
		test("should return invoice when found", async () => {
			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			const result = await useCase.execute(invoiceData.orderId!);

			expect(result).toBeDefined();
			expect(result.orderId).toBe(invoiceData.orderId!);
			expect(result.invoiceId).toBe(invoiceData.invoiceId!);
		});

		test("should throw InvoiceNotFoundError when invoice not found", async () => {
			await expect(useCase.execute("NON-EXISTENT")).rejects.toThrow(InvoiceNotFoundError);
		});

		test("should log fetching invoice", async () => {
			const invoiceData = invoiceFixtures.complete();
			const invoice = new Invoice(invoiceData);
			invoiceRepo.seedInvoice(invoice);

			await useCase.execute(invoiceData.orderId!);

			expect(logger.hasLog("info", "Fetching invoice")).toBe(true);
		});

		test("should initialize with debug log", () => {
			resetAllMocks(logger, invoiceRepo, customerRepo, codeGenerator);
			new GetInvoiceUseCase({
				logger,
				invoiceRepository: invoiceRepo,
			});

			expect(logger.hasLog("debug", "initialized")).toBe(true);
		});
	});
});
