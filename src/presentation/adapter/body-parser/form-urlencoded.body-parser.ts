import { InvalidTextBodyError } from "../../error";
import type { RequestBodyParser } from "./body-parser.interface";

/**
 * Parser for URL-encoded form data request bodies
 * Handles content type: application/x-www-form-urlencoded
 */
export class FormUrlEncodedBodyParser implements RequestBodyParser {
	supports(contentType: string | null): boolean {
		return contentType?.includes("application/x-www-form-urlencoded") ?? false;
	}

	async parse(request: Request): Promise<unknown> {
		try {
			const bodyString = await request.text();
			const bodyParams = new URLSearchParams(bodyString);
			return Object.fromEntries(bodyParams.entries());
		} catch (error) {
			throw new InvalidTextBodyError((error as Error).message);
		}
	}
}
