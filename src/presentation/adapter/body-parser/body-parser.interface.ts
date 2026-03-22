/**
 * Strategy interface for request body parsing
 * Implementations handle different content types (JSON, form-urlencoded, etc.)
 */
export interface RequestBodyParser {
	/**
	 * Check if this parser supports the given content type
	 * @param contentType - The Content-Type header value
	 * @returns true if this parser can handle the content type
	 */
	supports(contentType: string | null): boolean;

	/**
	 * Parse the request body
	 * @param request - The incoming HTTP request
	 * @returns Parsed body data
	 * @throws {InvalidJsonBodyError | InvalidTextBodyError} If parsing fails
	 */
	parse(request: Request): Promise<unknown>;
}
