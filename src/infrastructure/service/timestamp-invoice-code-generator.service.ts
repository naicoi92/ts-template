import type { InvoiceCodeGenerator } from "../../domain/interface";

/**
 * Timestamp-based Invoice Code Generator
 *
 * Uses Date.now().toString(36) for simplicity.
 * In production, consider using:
 * - ULID (Universally Unique Lexicographically Sortable Identifier)
 * - CUID2 (Collision-resistant Unique Identifiers)
 * - Custom format: INV-{YYYYMMDD}-{SEQUENTIAL}
 *
 * Benefits:
 * - Simple
 * - No external dependencies
 * - Easy to swap implementation via InvoiceCodeGenerator interface
 */
export class TimestampInvoiceCodeGenerator implements InvoiceCodeGenerator {
	generate(): string {
		const timestamp = Date.now();
		const unique = timestamp.toString(36);
		return unique;
	}
}
