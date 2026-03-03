import { describe, expect, test } from "bun:test";
import {
	InvoiceNotFoundError,
	RequestValidationError,
} from "../../../src/domain/error";
import { JsonRender } from "../../../src/presentation/render";
import { InvalidRequestMethodError } from "../../../src/presentation/error";
import { createMockLogger } from "../../mocks";

describe("JsonRender", () => {
	test("returns 200 json response by default", async () => {
		const render = new JsonRender<{ id: string }>({ logger: createMockLogger() });

		const response = await render.data({ id: "INV-001" });

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ id: "INV-001" });
	});

	test("supports status code and optional headers on data", async () => {
		const render = new JsonRender<{ id: string }>({ logger: createMockLogger() });

		const response = await render.data(
			{ id: "INV-001" },
			202,
			{ "X-Request-Id": "req-1" },
		);

		expect(response.status).toBe(202);
		expect(response.headers.get("X-Request-Id")).toBe("req-1");
		expect(await response.json()).toEqual({ id: "INV-001" });
	});

	test("supports created helper", async () => {
		const render = new JsonRender<{ id: string }>({ logger: createMockLogger() });

		const response = await render.created(
			{ id: "INV-001" },
			{ "X-Created": "true" },
		);

		expect(response.status).toBe(201);
		expect(response.headers.get("X-Created")).toBe("true");
		expect(await response.json()).toEqual({ id: "INV-001" });
	});

	test("supports noContent helper", async () => {
		const render = new JsonRender({ logger: createMockLogger() });

		const response = await render.noContent({ "X-Empty": "1" });

		expect(response.status).toBe(204);
		expect(response.headers.get("X-Empty")).toBe("1");
		expect(await response.text()).toBe("");
	});

	test("hides internal error message by default", async () => {
		const render = new JsonRender({ logger: createMockLogger() });

		const response = await render.error(new Error("database connection failed"));

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			error: {
				message: "database connection failed",
			},
		});
	});

	test("maps not found errors to 404", async () => {
		const render = new JsonRender({ logger: createMockLogger() });

		const response = await render.error(new InvoiceNotFoundError("ORDER-1"));

		expect(response.status).toBe(404);
		expect(await response.json()).toEqual({
			error: {
				message: "invoice with orderId ORDER-1 not found",
			},
		});
	});

	test("maps invalid method errors to 405", async () => {
		const render = new JsonRender({ logger: createMockLogger() });

		const response = await render.error(new InvalidRequestMethodError("DELETE"));

		expect(response.status).toBe(405);
		expect(await response.json()).toEqual({
			error: {
				message: "Invalid method: DELETE",
			},
		});
	});

	test("returns structured validation error details", async () => {
		const render = new JsonRender({ logger: createMockLogger() });
		const validationError = new RequestValidationError([
			{
				source: "body",
				field: "amount",
				message: "Amount is required",
				code: "invalid_type",
			},
		]);

		const response = await render.error(validationError);

		expect(response.status).toBe(400);
		expect(await response.json()).toEqual({
			error: {
				message: "Request validation failed",
				details: {
					errors: [
						{
							source: "body",
							field: "amount",
							message: "Amount is required",
							code: "invalid_type",
						},
					],
				},
			},
		});
	});

	test("stringifies non-Error values", async () => {
		const render = new JsonRender({ logger: createMockLogger() });

		const response = await render.error("something-wrong");

		expect(response.status).toBe(500);
		expect(await response.json()).toEqual({
			error: {
				message: "something-wrong",
			},
		});
	});
});
