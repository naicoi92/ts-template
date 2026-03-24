/**
 * Framework-agnostic header access interface
 *
 * Abstracts HTTP header retrieval to keep domain/presentation
 * layers independent of specific runtime implementations.
 */
export interface HeaderProvider {
	/**
	 * Get header value by name
	 * @param name - Case-insensitive header name
	 * @returns Header value or null if not found
	 */
	get(name: string): string | null;

	/**
	 * Check if header exists
	 * @param name - Case-insensitive header name
	 * @returns true if header exists, false otherwise
	 */
	has(name: string): boolean;
}
