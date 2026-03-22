import { describe, expect, test } from "bun:test";
import { FormUrlEncodedBodyParser } from "../../../../src/presentation/adapter/body-parser/form-urlencoded.body-parser";
import { InvalidTextBodyError } from "../../../../src/presentation/error";

describe("FormUrlEncodedBodyParser", () => {
	const parser = new FormUrlEncodedBodyParser();

	describe("supports()", () => {
		test('returns true for "application/x-www-form-urlencoded"', () => {
			expect(parser.supports("application/x-www-form-urlencoded")).toBe(true);
		});

		test('returns true for "application/x-www-form-urlencoded; charset=utf-8"', () => {
			expect(parser.supports("application/x-www-form-urlencoded; charset=utf-8")).toBe(true);
		});

		test('returns false for "application/json"', () => {
			expect(parser.supports("application/json")).toBe(false);
		});

		test('returns false for "text/plain"', () => {
			expect(parser.supports("text/plain")).toBe(false);
		});

		test("returns false for null", () => {
			expect(parser.supports(null)).toBe(false);
		});

		test("returns false for empty string", () => {
			expect(parser.supports("")).toBe(false);
		});
	});

	describe("parse()", () => {
		test("returns parsed object from form data", async () => {
			const formData = new URLSearchParams();
			formData.append("email", "test@example.com");
			formData.append("name", "Test User");

			const request = new Request("http://localhost/test", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: formData.toString(),
			});

			const result = await parser.parse(request);

			expect(result).toEqual({
				email: "test@example.com",
				name: "Test User",
			});
		});

		test("returns parsed object with multiple values (last wins)", async () => {
			const formData = new URLSearchParams();
			formData.append("key", "value1");
			formData.append("key", "value2");

			const request = new Request("http://localhost/test", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: formData.toString(),
			});

			const result = (await parser.parse(request)) as Record<string, string>;

			expect(result.key).toBe("value2");
		});

		test("returns empty object for empty body", async () => {
			const request = new Request("http://localhost/test", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: "",
			});

			const result = await parser.parse(request);

			expect(result).toEqual({});
		});

		test("handles special characters in values", async () => {
			const formData = new URLSearchParams();
			formData.append("message", "Hello World & Goodbye!");
			formData.append("email", "user+test@example.com");

			const request = new Request("http://localhost/test", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: formData.toString(),
			});

			const result = (await parser.parse(request)) as Record<string, string>;

			expect(result.message).toBe("Hello World & Goodbye!");
			expect(result.email).toBe("user+test@example.com");
		});

		test("handles URL-encoded values", async () => {
			const formData = new URLSearchParams();
			formData.append("url", "https://example.com?foo=bar&baz=qux");

			const request = new Request("http://localhost/test", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: formData.toString(),
			});

			const result = (await parser.parse(request)) as Record<string, string>;

			expect(result.url).toBe("https://example.com?foo=bar&baz=qux");
		});
	});
});
