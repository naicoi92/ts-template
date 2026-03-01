import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Invoice, Customer } from "../../../src/domain/entity";
import { InvoiceAmountMisMatch, InvoiceNotFoundError } from "../../../src/domain/error";
import { CreateInvoiceUseCase } from "../../../src/application/use-case/create-invoice.use-case";
import {
	createMockCustomerRepository,
	createMockInvoiceCodeGenerator,
	createMockInvoiceRepository,
	createMockLogger,
	resetAllMocks,
} from "../../mocks/index.ts";
import { invoiceFixtures, customerFixtures, invoiceCreateFixtures } from "../../fixtures";

describe("CreateInvoiceUseCase", () => {
	const logger = createMockLogger();
	const invoiceRepo = createMockInvoiceRepository();
	const customerRepo = createMockCustomerRepository();
	const codeGenerator = createMockInvoiceCodeGenerator();

	let useCase: CreateInvoiceUseCase;

	beforeEach(() => {
		resetAllMocks(logger, invoiceRepo, customerRepo, codeGenerator);
		codeGenerator.setCodes(["INV-TEST-001"]);
		useCase = new CreateInvoiceUseCase({
			logger,
			invoiceRepository: invoiceRepo,
			customerRepository: customerRepo,
			invoiceCodeGenerator: codeGenerator,
		});
	});

	afterEach(() => {
		resetAllMocks(logger, invoiceRepo, customerRepo, codeGenerator);
	});

	describe("execute", () => {
		test("should throw InvoiceNotFoundError when invoice does not exist", async () => {
			const input = invoiceCreateFixtures.valid();

			await expect(useCase.execute(input)).rejects.toThrow(InvoiceNotFoundError);
		});

		test("should return existing invoice when orderId exists with matching amount", async () => {
			const existingData = invoiceFixtures.complete();
			const existingInvoice = new Invoice(existingData);
			invoiceRepo.seedInvoice(existingInvoice);

			const input = {
				email: existingData.email!,
				orderId: existingData.orderId!,
				amount: existingData.amount!,
				code: existingData.code!,
				customerId: existingData.customerId!,
			};

			const result = await useCase.execute(input);

			expect(result.orderId).toBe(existingData.orderId!);
			expect(result.amount).toBe(existingData.amount!);
			expect(logger.hasLog("info", "Returning existing invoice")).toBe(true);
		});

		test("should throw InvoiceAmountMisMatch when amount differs", async () => {
			const existingData = invoiceFixtures.complete();
			const existingInvoice = new Invoice(existingData);
			invoiceRepo.seedInvoice(existingInvoice);

			const input = {
				email: existingData.email!,
				orderId: existingData.orderId!,
				amount: existingData.amount! + 1000,
				code: existingData.code!,
				customerId: existingData.customerId!,
			};

			await expect(useCase.execute(input)).rejects.toThrow(InvoiceAmountMisMatch);
			expect(logger.hasLog("error", "Invoice amount mismatch")).toBe(true);
		});

		test("should reuse existing customer when invoice exists", async () => {
			const existingData = invoiceFixtures.complete();
			const existingInvoice = new Invoice(existingData);
			invoiceRepo.seedInvoice(existingInvoice);
			
			const existingCustomer = new Customer(customerFixtures.complete());
			customerRepo.seedCustomer(existingCustomer);

			const input = {
				email: existingData.email!,
				orderId: existingData.orderId!,
				amount: existingData.amount!,
				code: existingData.code!,
				customerId: existingData.customerId!,
			};

			await useCase.execute(input);

			expect(customerRepo.getAllCustomers().length).toBe(1);
		});

		test("should use existing code for existing invoice", async () => {
			const existingData = invoiceFixtures.complete();
			const existingInvoice = new Invoice(existingData);
			invoiceRepo.seedInvoice(existingInvoice);
			codeGenerator.setCodes(["CUSTOM-CODE-123"]);

			const input = {
				email: existingData.email!,
				orderId: existingData.orderId!,
				amount: existingData.amount!,
				code: existingData.code!,
				customerId: existingData.customerId!,
			};

			const result = await useCase.execute(input);

			expect(result.code).toBe(existingData.code!);
		});
	});
});
