import type { HeaderProvider } from "../../domain/interface/header-provider.interface";

/**
 * Bun implementation of HeaderProvider wrapping native Headers
 */
export class BunHeaderProvider implements HeaderProvider {
	constructor(private readonly _headers: Headers) {}

	get(name: string): string | null {
		return this._headers.get(name);
	}

	has(name: string): boolean {
		return this._headers.has(name);
	}
}
