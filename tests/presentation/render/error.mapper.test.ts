import { describe, expect, test } from "bun:test";
import {
	InvoiceNotFoundError,
	CustomerNotFoundError,
	RequestValidationError,
	ServiceUnhealthyError,
	InvoiceAmountMisMatch,
	PartnerAuthenticationError,
} from "../../../src/domain/error";
import { ErrorMapper } from "../../../src/presentation/render/error.mapper";
import {
	InvalidRequestMethodError,
	InvalidJsonBodyError,
	InvalidTextBodyError,
} from "../../../src/presentation/error";

describe("ErrorMapper", () => {
	const mapper = new ErrorMapper();

	test("maps InvoiceNotFoundError to 404", () => {
		const result = mapper.map(new InvoiceNotFoundError("ORDER-1"));
		expect(result.status).toBe(404);
		expect(result.body).toEqual({
			error: { message: "invoice with orderId ORDER-1 not found" },
		});
	});

	test("maps CustomerNotFoundError to 404", () => {
		const result = mapper.map(new CustomerNotFoundError("test@example.com"));
		expect(result.status).toBe(404);
		expect(result.body).toEqual({
			error: { message: "customer with email test@example.com not found" },
		});
	});

	test("maps InvalidRequestMethodError to 405", () => {
		const result = mapper.map(new InvalidRequestMethodError("DELETE"));
		expect(result.status).toBe(405);
		expect(result.body).toEqual({
			error: { message: "Invalid method: DELETE" },
		});
	});

	test("maps ServiceUnhealthyError to 503 with whitelisted details", () => {
		const healthStatus = {
			status: "unhealthy" as const,
			timestamp: "2024-01-01T00:00:00Z",
			error: "DB connection failed",
			details: { dependency: "database" },
		};
		const result = mapper.map(new ServiceUnhealthyError(healthStatus));
		expect(result.status).toBe(503);
		expect(result.body.error.message).toBe("service unhealthy");
		expect(result.body.error.details).toEqual({
			status: "unhealthy",
			timestamp: "2024-01-01T00:00:00Z",
		});
		expect(result.body.error.details).not.toHaveProperty("error");
		expect(result.body.error.details).not.toHaveProperty("details");
	});

	test("maps RequestValidationError to 400 with details", () => {
		const validationError = new RequestValidationError([
			{
				source: "body",
				field: "amount",
				message: "Amount is required",
				code: "invalid_type",
			},
		]);
		const result = mapper.map(validationError);
		expect(result.status).toBe(400);
		expect(result.body).toEqual({
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

	test("maps InvalidJsonBodyError to 400", () => {
		const result = mapper.map(new InvalidJsonBodyError("unexpected token"));
		expect(result.status).toBe(400);
		expect(result.body.error.message).toBeTruthy();
	});

	test("maps InvalidTextBodyError to 400", () => {
		const result = mapper.map(new InvalidTextBodyError("invalid encoding"));
		expect(result.status).toBe(400);
		expect(result.body.error.message).toBeTruthy();
	});

	test("maps InvoiceAmountMisMatch to 400", () => {
		const result = mapper.map(new InvoiceAmountMisMatch("ORD-1", 100, 50));
		expect(result.status).toBe(400);
		expect(result.body.error.message).toContain("ORD-1");
	});

	test("maps PartnerAuthenticationError to 401", () => {
		const result = mapper.map(new PartnerAuthenticationError());
		expect(result.status).toBe(401);
		expect(result.body).toEqual({
			error: { message: "Authentication failed" },
		});
	});

	test("maps generic Error to 500 with generic message", () => {
		const result = mapper.map(new Error("database connection failed"));
		expect(result.status).toBe(500);
		expect(result.body).toEqual({
			error: { message: "Internal server error" },
		});
	});

	test("maps string error to 500 with generic message", () => {
		const result = mapper.map("something-wrong");
		expect(result.status).toBe(500);
		expect(result.body).toEqual({
			error: { message: "Internal server error" },
		});
	});
});
