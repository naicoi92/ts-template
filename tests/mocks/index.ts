export { MockLogger, createMockLogger } from "./logger.mock";
export { MockCustomerRepository, MockInvoiceRepository, createMockCustomerRepository, createMockInvoiceRepository } from "./repository.mock";
export { MockInvoiceCodeGenerator, createMockInvoiceCodeGenerator } from "./invoice-code-generator.mock";
export { MockConfig, createMockConfig } from "./config.mock";

import type { MockLogger } from "./logger.mock";
import type { MockInvoiceRepository, MockCustomerRepository } from "./repository.mock";
import type { MockInvoiceCodeGenerator } from "./invoice-code-generator.mock";

export function resetAllMocks(
	logger: MockLogger,
	invoiceRepo: MockInvoiceRepository,
	customerRepo: MockCustomerRepository,
	codeGenerator: MockInvoiceCodeGenerator,
): void {
	logger.reset();
	invoiceRepo.reset();
	customerRepo.reset();
	codeGenerator.reset();
}
