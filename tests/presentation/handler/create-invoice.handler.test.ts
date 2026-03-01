import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Invoice } from "../../../src/domain/entity";
import { CreateInvoiceUseCase } from "../../../src/application/use-case/create-invoice.use-case";
import { CreateInvoiceHandler } from "../../../src/presentation/handler/create-invoice.handler";
import {
	createMockCustomerRepository,
	createMockInvoiceCodeGenerator,
	createMockInvoiceRepository,
	createMockLogger,
	resetAllMocks,
} from "../../mocks/index.ts";
import { invoiceFixtures } from "../../fixtures/index.ts";

