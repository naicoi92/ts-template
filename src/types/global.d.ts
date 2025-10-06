// Global type definitions for Web APIs that might not be available in TypeScript

declare global {
	interface URLPatternInput {
		protocol?: string;
		username?: string;
		password?: string;
		hostname?: string;
		port?: string;
		pathname?: string;
		search?: string;
		hash?: string;
	}

	interface URLPatternInit {
		baseURL?: string;
		protocol?: string;
		username?: string;
		password?: string;
		hostname?: string;
		port?: string;
		pathname?: string;
		search?: string;
		hash?: string;
	}

	interface URLPatternResult {
		inputs: [URLPatternInput, URLPatternInput];
		protocol: { groups: Record<string, string> };
		username: { groups: Record<string, string> };
		password: { groups: Record<string, string> };
		hostname: { groups: Record<string, string> };
		port: { groups: Record<string, string> };
		pathname: { groups: Record<string, string> };
		search: { groups: Record<string, string> };
		hash: { groups: Record<string, string> };
	}

	class URLPattern {
		constructor(init: URLPatternInit | string, baseURL?: string);
		exec(input: string | URLPatternInput): URLPatternResult | null;
		test(input: string | URLPatternInput): boolean;
		toString(): string;
	}
}

export {};
