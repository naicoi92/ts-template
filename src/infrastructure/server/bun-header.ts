import type { RequestHeader } from "../../domain/interface";

/**
 * Bun implementation of HeaderProvider wrapping native Headers
 */
export class BunHeader implements RequestHeader {
	constructor(private readonly _headers: Headers) {}

	get(name: string): string | null {
		return this._headers.get(name);
	}

	has(name: string): boolean {
		return this._headers.has(name);
	}
}
