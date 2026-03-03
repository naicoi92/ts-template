import { beforeEach, describe, expect, mock, test } from "bun:test";
import { z } from "zod";
import { RequestAdapter } from "../../../src/presentation/adapter/request.adapter";
import type { Handler, ResponseRender } from "../../../src/domain/interface";
import { createMockLogger } from "../../mocks/index";
import {
	RequestValidationError,
} from "../../../src/domain/error";
import {
	InvalidJsonBodyError,
	InvalidRequestMethodError,
} from "../../../src/presentation/error/request-adapter.error";

interface MockResponseRender<TResponse> extends ResponseRender<TResponse, Response> {
	data: ReturnType<typeof mock>;
	error: ReturnType<typeof mock>;
}

function createMockResponseRender<TResponse>(): MockResponseRender<TResponse> {
	return {
		data: mock<(data: TResponse) => Promise<Response>>((data) => {
			return Promise.resolve(new Response(JSON.stringify(data), {
				headers: { "Content-Type": "application/json" },
			}));
		}),
		error: mock<(error: unknown) => Promise<Response>>((error) => {
			return Promise.resolve(new Response(JSON.stringify({ error: String(error) }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			}));
		}),
	};
}

interface MockHandler<TResponse, TParams, TQuery, TBody> extends Handler<TResponse, TParams, TQuery, TBody> {
	handle: ReturnType<typeof mock>;
}

function createMockHandler<TResponse, TParams, TQuery, TBody>(
	options: {
		pathname: string;
		method: string;
		paramsSchema?: z.ZodSchema<TParams>;
		querySchema?: z.ZodSchema<TQuery>;
		bodySchema?: z.ZodSchema<TBody>;
		responseSchema?: z.ZodSchema<TResponse>;
	},
): MockHandler<TResponse, TParams, TQuery, TBody> {
	return {
		pathname: options.pathname,
		method: options.method,
		paramsSchema: options.paramsSchema,
		querySchema: options.querySchema,
		bodySchema: options.bodySchema,
		responseSchema: options.responseSchema ?? z.any(),
		handle: mock<() => Promise<TResponse>>(() => Promise.resolve({} as TResponse)),
	};
}

describe("RequestAdapter", () => {
	const logger = createMockLogger();
	let mockRender: MockResponseRender<{ id: string; status: string }>;
	let mockHandler: MockHandler<{ id: string; status: string }, void, void, void>;
	let adapter: RequestAdapter<{ id: string; status: string }, void, void, void>;

	beforeEach(() => {
		logger.reset();
		mockRender = createMockResponseRender();
		mockHandler = createMockHandler({
			pathname: "/invoices",
			method: "GET",
		});
		adapter = new RequestAdapter({
			logger,
			handler: mockHandler,
			render: mockRender,
		});
	});

	describe("Success cases", () => {
		test("should call render.data() when handler returns data successfully", async () => {
			const responseData = { id: "INV-001", status: "pending" };
			mockHandler.handle.mockImplementation(() => Promise.resolve(responseData));

			const request = new Request("http://localhost/invoices", { method: "GET" });
			await adapter.handle(request);

			expect(mockRender.data).toHaveBeenCalledTimes(1);
			expect(mockRender.data.mock.calls[0]![0]).toEqual(responseData);
			expect(mockRender.error).not.toHaveBeenCalled();
		});

		test("should call handler.handle() with parsed request data", async () => {
			mockHandler.handle.mockImplementation(() => Promise.resolve({ id: "1", status: "ok" }));

			const request = new Request("http://localhost/invoices", { method: "GET" });
			await adapter.handle(request);

			expect(mockHandler.handle).toHaveBeenCalledTimes(1);
			const callArgs = mockHandler.handle.mock.calls[0]![0];
			expect(callArgs).toHaveProperty("params");
			expect(callArgs).toHaveProperty("query");
			expect(callArgs).toHaveProperty("body");
		});
	});

	describe("Error cases", () => {
		test("should call render.error() when handler throws an error", async () => {
			const handlerError = new Error("Handler failed");
			mockHandler.handle.mockImplementation(() => Promise.reject(handlerError));

			const request = new Request("http://localhost/invoices", { method: "GET" });
			await adapter.handle(request);

			expect(mockRender.error).toHaveBeenCalledTimes(1);
			expect(mockRender.error.mock.calls[0]![0]).toBe(handlerError);
			expect(mockRender.data).not.toHaveBeenCalled();
		});

		test("should call render.error() when method does not match", async () => {
			const request = new Request("http://localhost/invoices", { method: "DELETE" });
			await adapter.handle(request);

			expect(mockRender.error).toHaveBeenCalledTimes(1);
			const error = mockRender.error.mock.calls[0]![0];
			expect(error).toBeInstanceOf(InvalidRequestMethodError);
		});
	});

	describe("Body parsing", () => {
		test("should parse JSON body and call handler with parsed data", async () => {
			const bodySchema = z.object({ name: z.string(), amount: z.number() });
			const mockBodyHandler = createMockHandler<{ id: string }, void, void, { name: string; amount: number }>({
				pathname: "/invoices",
				method: "POST",
				bodySchema,
			});
			const bodyAdapter = new RequestAdapter({
				logger,
				handler: mockBodyHandler,
				render: createMockResponseRender(),
			});

			const bodyData = { name: "Invoice 1", amount: 100 };
			const request = new Request("http://localhost/invoices", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(bodyData),
			});

			await bodyAdapter.handle(request);

			expect(mockBodyHandler.handle).toHaveBeenCalledTimes(1);
			const callArgs = mockBodyHandler.handle.mock.calls[0]![0];
			expect(callArgs.body).toEqual(bodyData);
		});

		test("should call render.error() when JSON body is invalid", async () => {
			const bodySchema = z.object({ name: z.string() });
			const mockBodyHandler = createMockHandler<{ id: string }, void, void, { name: string }>({
				pathname: "/invoices",
				method: "POST",
				bodySchema,
			});
			const bodyRender = createMockResponseRender<{ id: string }>();
			const bodyAdapter = new RequestAdapter({
				logger,
				handler: mockBodyHandler,
				render: bodyRender,
			});

			const request = new Request("http://localhost/invoices", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: "{ invalid json",
			});

			await bodyAdapter.handle(request);

			expect(bodyRender.error).toHaveBeenCalledTimes(1);
			const error = bodyRender.error.mock.calls[0]![0];
			expect(error).toBeInstanceOf(InvalidJsonBodyError);
		});

		test("should call render.error() when body validation fails for empty string", async () => {
			const bodySchema = z.object({ name: z.string().min(1) });
			const mockBodyHandler = createMockHandler<{ id: string }, void, void, { name: string }>({
				pathname: "/invoices",
				method: "POST",
				bodySchema,
			});
			const bodyRender = createMockResponseRender<{ id: string }>();
			const bodyAdapter = new RequestAdapter({
				logger,
				handler: mockBodyHandler,
				render: bodyRender,
			});

			const request = new Request("http://localhost/invoices", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: "" }),
			});

			await bodyAdapter.handle(request);

			expect(bodyRender.error).toHaveBeenCalledTimes(1);
			const error = bodyRender.error.mock.calls[0]![0];
			expect(error).toBeInstanceOf(RequestValidationError);
		});

		test("should parse form-urlencoded body", async () => {
			const bodySchema = z.object({ email: z.string(), name: z.string() });
			const mockBodyHandler = createMockHandler<{ id: string }, void, void, { email: string; name: string }>({
				pathname: "/forms",
				method: "POST",
				bodySchema,
			});
			const bodyRender = createMockResponseRender<{ id: string }>();
			const bodyAdapter = new RequestAdapter({
				logger,
				handler: mockBodyHandler,
				render: bodyRender,
			});

			const formData = new URLSearchParams();
			formData.append("email", "test@example.com");
			formData.append("name", "Test User");

			const request = new Request("http://localhost/forms", {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded" },
				body: formData.toString(),
			});

			await bodyAdapter.handle(request);

			expect(mockBodyHandler.handle).toHaveBeenCalledTimes(1);
			const callArgs = mockBodyHandler.handle.mock.calls[0]![0];
			expect(callArgs.body).toEqual({ email: "test@example.com", name: "Test User" });
		});
	});

	describe("Query parsing", () => {
		test("should parse query parameters and call handler with parsed data", async () => {
			const querySchema = z.object({
				page: z.coerce.number(),
				limit: z.coerce.number(),
			});
			const mockQueryHandler = createMockHandler<{ id: string }, void, { page: number; limit: number }, void>({
				pathname: "/invoices",
				method: "GET",
				querySchema,
			});
			const queryAdapter = new RequestAdapter({
				logger,
				handler: mockQueryHandler,
				render: createMockResponseRender(),
			});

			const request = new Request("http://localhost/invoices?page=2&limit=10", { method: "GET" });
			await queryAdapter.handle(request);

			expect(mockQueryHandler.handle).toHaveBeenCalledTimes(1);
			const callArgs = mockQueryHandler.handle.mock.calls[0]![0];
			expect(callArgs.query).toEqual({ page: 2, limit: 10 });
		});

		test("should call render.error() when query validation fails", async () => {
			const querySchema = z.object({
				page: z.coerce.number().min(1),
			});
			const mockQueryHandler = createMockHandler<{ id: string }, void, { page: number }, void>({
				pathname: "/invoices",
				method: "GET",
				querySchema,
			});
			const queryRender = createMockResponseRender<{ id: string }>();
			const queryAdapter = new RequestAdapter({
				logger,
				handler: mockQueryHandler,
				render: queryRender,
			});

			const request = new Request("http://localhost/invoices?page=0", { method: "GET" });
			await queryAdapter.handle(request);

			expect(queryRender.error).toHaveBeenCalledTimes(1);
			const error = queryRender.error.mock.calls[0]![0];
			expect(error).toBeInstanceOf(RequestValidationError);
		});
	});

	describe("Params parsing", () => {
		test("should parse path parameters and call handler with parsed data", async () => {
			const paramsSchema = z.object({ id: z.string().uuid() });
			const mockParamsHandler = createMockHandler<{ id: string }, { id: string }, void, void>({
				pathname: "/invoices/:id",
				method: "GET",
				paramsSchema,
			});
			const paramsAdapter = new RequestAdapter({
				logger,
				handler: mockParamsHandler,
				render: createMockResponseRender(),
			});

			const request = new Request("http://localhost/invoices/550e8400-e29b-41d4-a716-446655440000", { method: "GET" });
			await paramsAdapter.handle(request);

			expect(mockParamsHandler.handle).toHaveBeenCalledTimes(1);
			const callArgs = mockParamsHandler.handle.mock.calls[0]![0];
			expect(callArgs.params).toEqual({ id: "550e8400-e29b-41d4-a716-446655440000" });
		});

		test("should call render.error() when params validation fails", async () => {
			const paramsSchema = z.object({ id: z.string().uuid() });
			const mockParamsHandler = createMockHandler<{ id: string }, { id: string }, void, void>({
				pathname: "/invoices/:id",
				method: "GET",
				paramsSchema,
			});
			const paramsRender = createMockResponseRender<{ id: string }>();
			const paramsAdapter = new RequestAdapter({
				logger,
				handler: mockParamsHandler,
				render: paramsRender,
			});

			const request = new Request("http://localhost/invoices/invalid-uuid", { method: "GET" });
			await paramsAdapter.handle(request);

			expect(paramsRender.error).toHaveBeenCalledTimes(1);
			const error = paramsRender.error.mock.calls[0]![0];
			expect(error).toBeInstanceOf(RequestValidationError);
		});
	});

	describe("Response validation", () => {
		test("should validate response against responseSchema", async () => {
			const responseSchema = z.object({
				id: z.string(),
				status: z.enum(["pending", "paid", "cancelled"]),
			});
			const mockValidHandler = createMockHandler<{ id: string; status: string }, void, void, void>({
				pathname: "/invoices",
				method: "GET",
				responseSchema,
			});
			mockValidHandler.handle.mockImplementation(() =>
				Promise.resolve({ id: "INV-001", status: "pending" }),
			);
			const validAdapter = new RequestAdapter({
				logger,
				handler: mockValidHandler,
				render: createMockResponseRender(),
			});

			const request = new Request("http://localhost/invoices", { method: "GET" });
			await validAdapter.handle(request);

			expect(mockValidHandler.handle).toHaveBeenCalledTimes(1);
		});

		test("should call render.error() when response validation fails", async () => {
			const responseSchema = z.object({
				id: z.string(),
				status: z.enum(["pending", "paid", "cancelled"]),
			});
			const mockInvalidHandler = createMockHandler<{ id: string; status: string }, void, void, void>({
				pathname: "/invoices",
				method: "GET",
				responseSchema,
			});
			mockInvalidHandler.handle.mockImplementation(() =>
				Promise.resolve({ id: "INV-001", status: "invalid-status" as unknown as "pending" }),
			);
			const invalidRender = createMockResponseRender<{ id: string; status: string }>();
			const invalidAdapter = new RequestAdapter({
				logger,
				handler: mockInvalidHandler,
				render: invalidRender,
			});

			const request = new Request("http://localhost/invoices", { method: "GET" });
			await invalidAdapter.handle(request);

			expect(invalidRender.error).toHaveBeenCalledTimes(1);
			const error = invalidRender.error.mock.calls[0]![0];
			expect(error).toBeInstanceOf(RequestValidationError);
		});
	});

	describe("Logging", () => {
		test("should log parsed request data", async () => {
			mockHandler.handle.mockImplementation(() => Promise.resolve({ id: "1", status: "ok" }));

			const request = new Request("http://localhost/invoices", { method: "GET" });
			await adapter.handle(request);

			expect(logger.hasLog("debug", "Request parsed")).toBe(true);
		});
	});
});
