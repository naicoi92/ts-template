import { describe, expect, test } from "bun:test";
import { JsonBodyParser } from "../../../../src/presentation/adapter/body-parser/json.body-parser";
import { InvalidJsonBodyError } from "../../../../src/presentation/error";

describe("JsonBodyParser", () => {
	const parser = new JsonBodyParser();

	describe("supports()", () => {
		test('returns true for "application/json"', () => {
			expect(parser.supports("application/json")).toBe(true);
		});

		test('returns true for "application/json; charset=utf-8"', () => {
			expect(parser.supports("application/json; charset=utf-8")).toBe(true);
		});

		test('returns true for "application/json;charset=utf-8" (no space)', () => {
			expect(parser.supports("application/json;charset=utf-8")).toBe(true);
		});

		test('returns false for "text/plain"', () => {
			expect(parser.supports("text/plain")).toBe(false);
		});

		test('returns false for "application/x-www-form-urlencoded"', () => {
			expect(parser.supports("application/x-www-form-urlencoded")).toBe(false);
		});

		test("returns false for null", () => {
			expect(parser.supports(null)).toBe(false);
		});

		test("returns false for empty string", () => {
			expect(parser.supports("")).toBe(false);
		});
	});

	describe("parse()", () => {
		test("returns parsed JSON object", async () => {
			const bodyData = { name: "Test", amount: 100 };
			const request = new Request("http://localhost/test", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(bodyData),
			});

			const result = await parser.parse(request);

			expect(result).toEqual(bodyData);
		});

		test("returns parsed JSON array", async () => {
			const bodyData = [1, 2, 3];
			const request = new Request("http://localhost/test", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(bodyData),
			});

			const result = await parser.parse(request);

			expect(result).toEqual(bodyData);
		});

		test("returns parsed nested JSON object", async () => {
			const bodyData = {
				user: { name: "John", email: "john@example.com" },
				items: [{ id: 1, name: "Item 1" }],
			};
			const request = new Request("http://localhost/test", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(bodyData),
			});

			const result = await parser.parse(request);

			expect(result).toEqual(bodyData);
		});

		test("throws InvalidJsonBodyError for invalid JSON", async () => {
			const request = new Request("http://localhost/test", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: "{ invalid json",
			});

			expect(parser.parse(request)).rejects.toThrow(InvalidJsonBodyError);
		});

		test("throws InvalidJsonBodyError with reason for invalid JSON", async () => {
			const request = new Request("http://localhost/test", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: "{ invalid json",
			});

			try {
				await parser.parse(request);
				expect.unreachable();
			} catch (error) {
				expect(error).toBeInstanceOf(InvalidJsonBodyError);
				expect((error as InvalidJsonBodyError).reason).toBeDefined();
			}
		});
	});
});
