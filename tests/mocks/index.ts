export { MockLogger, createMockLogger } from "./logger.mock";
export {
	MockCustomerRepository,
	MockInvoiceRepository,
	createMockCustomerRepository,
	createMockInvoiceRepository,
} from "./repository.mock";
export {
	MockInvoiceCodeGenerator,
	createMockInvoiceCodeGenerator,
} from "./invoice-code-generator.mock";
export { MockConfig, createMockConfig } from "./config.mock";
export {
	MockPartnerRepository,
	createMockPartnerRepository,
} from "./partner-repository.mock";
export {
	MockSignatureVerifier,
	createMockSignatureVerifier,
} from "./signature-verifier.mock";

import type { MockLogger } from "./logger.mock";
import type { MockInvoiceRepository, MockCustomerRepository } from "./repository.mock";
import type { MockInvoiceCodeGenerator } from "./invoice-code-generator.mock";
import type { MockPartnerRepository } from "./partner-repository.mock";
import type { MockSignatureVerifier } from "./signature-verifier.mock";

export function resetAllMocks(
	logger: MockLogger,
	invoiceRepo?: MockInvoiceRepository,
	customerRepo?: MockCustomerRepository,
	codeGenerator?: MockInvoiceCodeGenerator,
	partnerRepo?: MockPartnerRepository,
	signatureVerifier?: MockSignatureVerifier,
): void {
	logger.reset();
	invoiceRepo?.reset();
	customerRepo?.reset();
	codeGenerator?.reset();
	partnerRepo?.reset();
	signatureVerifier?.reset();
}
