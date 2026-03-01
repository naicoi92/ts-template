import type { InvoiceCodeGenerator } from "../../src/domain/interface";

export class MockInvoiceCodeGenerator implements InvoiceCodeGenerator {
	private codes: string[] = [];
	private currentIndex = 0;
	private prefix = "INV-";

	generate(): string {
		const code = this.codes[this.currentIndex] ?? `${this.prefix}${Date.now()}`;
		this.currentIndex++;
		return code;
	}

	reset(): void {
		this.codes = [];
		this.currentIndex = 0;
	}

	setCodes(codes: string[]): void {
		this.codes = codes;
		this.currentIndex = 0;
	}
}

export function createMockInvoiceCodeGenerator(): MockInvoiceCodeGenerator {
	return new MockInvoiceCodeGenerator();
}
