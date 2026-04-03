import type { RequestHeader } from "../../src/domain/interface";

export class MockRequestHeader implements RequestHeader {
	private headers: Map<string, string> = new Map();

	setHeader(name: string, value: string | undefined): void {
		if (value !== undefined) {
			this.headers.set(name.toLowerCase(), value);
		}
	}

	get(name: string): string | null {
		return this.headers.get(name.toLowerCase()) ?? null;
	}

	has(name: string): boolean {
		return this.headers.has(name.toLowerCase());
	}

	clear(): void {
		this.headers.clear();
	}
}

export function createMockRequestHeader(): MockRequestHeader {
	return new MockRequestHeader();
}
