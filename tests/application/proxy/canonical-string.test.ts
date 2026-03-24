import { describe, expect, test } from "bun:test";
import { CanonicalStringBuilder } from "../../../src/application/proxy/canonical-string";

describe("CanonicalStringBuilder", () => {
	const canonicalStringBuilder = new CanonicalStringBuilder();

	describe("POST /invoices with body data", () => {
		test("should build canonical string with POST and body data", () => {
			const result = canonicalStringBuilder.build("POST", "/invoices", {
				amount: 100,
				customerId: "123",
			});
			expect(result).toBe('POST\n/invoices\n{"amount":100,"customerId":"123"}');
		});

		test("should uppercase method before concatenation", () => {
			const result = canonicalStringBuilder.build("post", "/invoices", { amount: 100 });
			expect(result).toBe('POST\n/invoices\n{"amount":100}');
		});
	});

	describe("GET /invoices/ORDER-1 with empty data segment", () => {
		test("should build canonical string with GET and no data", () => {
			const result = canonicalStringBuilder.build("GET", "/invoices/ORDER-1");
			expect(result).toBe("GET\n/invoices/ORDER-1\n");
		});

		test("should build canonical string with GET and undefined data", () => {
			const result = canonicalStringBuilder.build("GET", "/invoices/ORDER-1", undefined);
			expect(result).toBe("GET\n/invoices/ORDER-1\n");
		});

		test("should build canonical string with GET and null data", () => {
			const result = canonicalStringBuilder.build("GET", "/invoices/ORDER-1", null);
			expect(result).toBe("GET\n/invoices/ORDER-1\n");
		});
	});

	describe("sorted object keys (deterministic regardless of original order)", () => {
		test("should sort object keys alphabetically", () => {
			const result = canonicalStringBuilder.build("POST", "/test", { z: 1, a: 2 });
			expect(result).toBe('POST\n/test\n{"a":2,"z":1}');
		});

		test("should produce same result regardless of key insertion order", () => {
			const result1 = canonicalStringBuilder.build("POST", "/test", { a: 1, b: 2, c: 3 });
			const result2 = canonicalStringBuilder.build("POST", "/test", { c: 3, b: 2, a: 1 });
			const result3 = canonicalStringBuilder.build("POST", "/test", { b: 2, c: 3, a: 1 });

			expect(result1).toBe(result2);
			expect(result2).toBe(result3);
		});
	});

	describe("nested object sorting", () => {
		test("should sort nested object keys recursively", () => {
			const result = canonicalStringBuilder.build("POST", "/test", {
				b: { z: 1, a: 2 },
			});
			expect(result).toBe('POST\n/test\n{"b":{"a":2,"z":1}}');
		});

		test("should sort deeply nested object keys", () => {
			const result = canonicalStringBuilder.build("POST", "/test", {
				level1: {
					z: 1,
					level2: { c: 3, a: 1, level3: { e: 5, b: 2 } },
					y: 2,
				},
			});
			expect(result).toBe(
				'POST\n/test\n{"level1":{"level2":{"a":1,"c":3,"level3":{"b":2,"e":5}},"y":2,"z":1}}',
			);
		});

		test("should sort keys in arrays containing objects", () => {
			const result = canonicalStringBuilder.build("POST", "/test", {
				items: [{ z: 1, a: 2 }, { d: 4, b: 3 }],
			});
			expect(result).toBe('POST\n/test\n{"items":[{"a":2,"z":1},{"b":3,"d":4}]}');
		});
	});

	describe("empty/undefined data", () => {
		test("should handle empty object", () => {
			const result = canonicalStringBuilder.build("POST", "/test", {});
			expect(result).toBe("POST\n/test\n{}");
		});

		test("should handle empty array", () => {
			const result = canonicalStringBuilder.build("POST", "/test", []);
			expect(result).toBe("POST\n/test\n[]");
		});

		test("should handle array with primitives (no sorting)", () => {
			const result = canonicalStringBuilder.build("POST", "/test", [1, 2, 3]);
			expect(result).toBe("POST\n/test\n[1,2,3]");
		});

		test("should handle mixed array with objects and primitives", () => {
			const result = canonicalStringBuilder.build("POST", "/test", [{ z: 1, a: 2 }, 3, "text"]);
			expect(result).toBe('POST\n/test\n[{"a":2,"z":1},3,"text"]');
		});
	});

	describe("primitive values", () => {
		test("should stringify number", () => {
			const result = canonicalStringBuilder.build("POST", "/test", 42);
			expect(result).toBe("POST\n/test\n42");
		});

		test("should stringify string", () => {
			const result = canonicalStringBuilder.build("POST", "/test", "hello");
			expect(result).toBe('POST\n/test\n"hello"');
		});

		test("should stringify boolean", () => {
			const result = canonicalStringBuilder.build("POST", "/test", true);
			expect(result).toBe("POST\n/test\ntrue");
		});
	});
});
