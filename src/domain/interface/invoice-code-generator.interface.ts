/**
 * Invoice Code Generator Interface
 *
 * Domain interface for generating unique invoice codes.
 * Allows swapping implementations without affecting business logic.
 *
 * Implementations:
 * - TimestampInvoiceCodeGenerator: Simple timestamp-based codes
 * - Future: ULID, CUID2, or custom format generators
 */
export interface InvoiceCodeGenerator {
	/**
	 * Generate a unique invoice code
	 * @returns A unique invoice code string
	 */
	generate(): string;
}
