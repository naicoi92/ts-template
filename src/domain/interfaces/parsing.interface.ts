/**
 * Parsing Interfaces - Domain Layer
 *
 * Abstract interfaces for data parsing operations
 * Follows Dependency Inversion Principle - high-level modules depend on abstractions
 */

/**
 * Generic interface for parsing raw data into structured format
 * Domain-level abstraction, independent of specific data sources
 */
export interface IBodyParser<T = unknown> {
	/**
	 * Parses raw data into structured format
	 * @param data - Raw data to parse
	 * @returns Parsed and typed data
	 */
	parse(data: unknown): Promise<T>;
}

/**
 * HTTP-specific body parser interface
 * Extends generic parser for HTTP request bodies
 */
export interface IHttpRequestBodyParser<T = unknown> extends IBodyParser<T> {
	/**
	 * Parses HTTP request body and returns structured data
	 * @param request - The HTTP request to parse
	 * @returns Parsed data or throws domain error
	 */
	parse(request: Request): Promise<T>;
}
