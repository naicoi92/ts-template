import { InvalidJsonBodyError } from "../../error";
import type { RequestBodyParser } from "./body-parser.interface";

/**
 * Parser for JSON request bodies
 * Handles content type: application/json
 */
export class JsonBodyParser implements RequestBodyParser {
	supports(contentType: string | null): boolean {
		return contentType?.includes("application/json") ?? false;
	}

	async parse(request: Request): Promise<unknown> {
		try {
			return await request.json();
		} catch (error) {
			throw new InvalidJsonBodyError((error as Error).message);
		}
	}
}
