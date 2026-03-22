import { describe, expect, test } from "bun:test";
import { RequestValidationError, ServiceUnhealthyError } from "../../../src/domain/error";
import { ErrorSerializer } from "../../../src/presentation/render/error.serializer";

describe("ErrorSerializer", () => {
	const serializer = new ErrorSerializer();

	describe("serializeValidation", () => {
		test("exposes validation errors array", () => {
			const error = new RequestValidationError([
				{ source: "body", field: "amount", message: "Amount is required", code: "invalid_type" },
			]);

			const result = serializer.serializeValidation(error);

			expect(result).toEqual({
				errors: [
					{ source: "body", field: "amount", message: "Amount is required", code: "invalid_type" },
				],
			});
		});

		test("handles multiple errors", () => {
			const error = new RequestValidationError([
				{ source: "body", field: "amount", message: "Required", code: "invalid_type" },
				{ source: "body", field: "orderId", message: "Invalid", code: "invalid_string" },
			]);

			const result = serializer.serializeValidation(error);

			expect(result.errors).toHaveLength(2);
		});
	});

	describe("serializeHealth", () => {
		test("whitelists status and timestamp only", () => {
			const healthStatus = {
				status: "unhealthy" as const,
				timestamp: "2024-01-01T00:00:00Z",
				error: "DB connection failed",
				details: { dependency: "database", cause: "password auth failed" },
			};
			const error = new ServiceUnhealthyError(healthStatus);

			const result = serializer.serializeHealth(error);

			expect(result).toEqual({
				status: "unhealthy",
				timestamp: "2024-01-01T00:00:00Z",
			});
		});

		test("hides internal error message", () => {
			const healthStatus = {
				status: "unhealthy" as const,
				timestamp: "2024-01-01T00:00:00Z",
				error: "sensitive db password error",
			};
			const error = new ServiceUnhealthyError(healthStatus);

			const result = serializer.serializeHealth(error);

			expect(result).not.toHaveProperty("error");
			expect(JSON.stringify(result)).not.toContain("sensitive");
		});

		test("hides internal details", () => {
			const healthStatus = {
				status: "unhealthy" as const,
				timestamp: "2024-01-01T00:00:00Z",
				details: { connectionString: "postgres://user:pass@host/db" },
			};
			const error = new ServiceUnhealthyError(healthStatus);

			const result = serializer.serializeHealth(error);

			expect(result).not.toHaveProperty("details");
			expect(JSON.stringify(result)).not.toContain("connectionString");
			expect(JSON.stringify(result)).not.toContain("postgres://");
		});

		test("handles healthy status", () => {
			const healthStatus = {
				status: "healthy" as const,
				timestamp: "2024-01-01T00:00:00Z",
			};
			const error = new ServiceUnhealthyError(healthStatus);

			const result = serializer.serializeHealth(error);

			expect(result.status).toBe("healthy");
		});
	});
});
