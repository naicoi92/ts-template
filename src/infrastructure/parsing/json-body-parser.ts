import { InvalidRequestError } from "@/domain/errors/validation.errors";
import type { IHttpRequestBodyParser } from "@/domain/interfaces/parsing.interface";

/**
 * JSON Request Body Parser
 *
 * Concrete implementation for parsing JSON request bodies
 * Infrastructure layer implementation of domain interface
 * Single Responsibility: Only handles JSON parsing
 */
export class JsonBodyParser<T = unknown> implements IHttpRequestBodyParser<T> {
	async parse(request: Request): Promise<T> {
		try {
			return (await request.json()) as T;
		} catch (error) {
			if (error instanceof SyntaxError) {
				throw new InvalidRequestError("Invalid JSON in request body", {
					originalError: error.message,
				});
			}
			throw new InvalidRequestError("Failed to parse request body", {
				originalError: error instanceof Error ? error.message : String(error),
			});
		}
	}
}
