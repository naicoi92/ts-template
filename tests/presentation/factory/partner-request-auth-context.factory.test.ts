import { describe, expect, test } from "bun:test";
import { createMockHeaderProvider } from "../../mocks/header-provider.mock";
import { PartnerRequestAuthContextFactory } from "../../../src/presentation/factory/partner-request-auth-context.factory";

describe("PartnerRequestAuthContextFactory", () => {
	const factory = new PartnerRequestAuthContextFactory();

	describe("create", () => {
		test("should build AuthContext from headers with data (POST)", () => {
			const headers = createMockHeaderProvider();
			headers.setHeader("x-partner-name", "test-partner");
			headers.setHeader("x-signature", "sig123");
			headers.setHeader("x-timestamp", "1234567890");

			const body = { orderId: "ORDER-001", amount: 100000 };
			const result = factory.create({
				headers,
				method: "POST",
				pathname: "/invoices",
				data: body,
			});

			expect(result).toEqual({
				partnerName: "test-partner",
				signature: "sig123",
				request: {
					method: "POST",
					pathname: "/invoices",
					timestamp: "1234567890",
					data: body,
				},
			});
		});

		test("should build AuthContext from headers without data (GET)", () => {
			const headers = createMockHeaderProvider();
			headers.setHeader("x-partner-name", "test-partner");
			headers.setHeader("x-signature", "sig123");
			headers.setHeader("x-timestamp", "1234567890");

			const result = factory.create({
				headers,
				method: "GET",
				pathname: "/invoices/ORDER-001",
			});

			expect(result).toEqual({
				partnerName: "test-partner",
				signature: "sig123",
				request: {
					method: "GET",
					pathname: "/invoices/ORDER-001",
					timestamp: "1234567890",
				},
			});
			expect(result.request).not.toHaveProperty("data");
		});

		test("should coerce missing headers to empty string", () => {
			const headers = createMockHeaderProvider();

			const result = factory.create({
				headers,
				method: "GET",
				pathname: "/invoices/ORDER-001",
			});

			expect(result.partnerName).toBe("");
			expect(result.signature).toBe("");
			expect(result.request.timestamp).toBe("");
		});

		test("should omit data field when data is undefined", () => {
			const headers = createMockHeaderProvider();
			headers.setHeader("x-partner-name", "partner");
			headers.setHeader("x-signature", "sig");
			headers.setHeader("x-timestamp", "ts");

			const result = factory.create({
				headers,
				method: "DELETE",
				pathname: "/invoices/ORDER-001",
			});

			expect(result.request).toEqual({
				method: "DELETE",
				pathname: "/invoices/ORDER-001",
				timestamp: "ts",
			});
			expect("data" in result.request).toBe(false);
		});

		test("should include data when explicitly provided as null", () => {
			const headers = createMockHeaderProvider();
			headers.setHeader("x-partner-name", "partner");
			headers.setHeader("x-signature", "sig");
			headers.setHeader("x-timestamp", "ts");

			const result = factory.create({
				headers,
				method: "POST",
				pathname: "/invoices",
				data: null,
			});

			expect(result.request.data).toBeNull();
		});
	});
});
