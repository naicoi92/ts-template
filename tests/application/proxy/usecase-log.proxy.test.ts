import { describe, expect, test, beforeEach } from "bun:test";
import type { UseCase } from "../../../src/domain/interface/usecase.interface";
import { MockUseCase } from "../../mocks/usecase.mock";
import { MockLogger } from "../../mocks/logger.mock";

describe("UseCaseLogProxy", () => {
	let mockUseCase: MockUseCase<object, { success: true; input: object }>;
	let mockLogger: MockLogger;
	let proxy: UseCase<object, { success: true; input: object }>;

	beforeEach(async () => {
		mockUseCase = new MockUseCase<object, { success: true; input: object }>();
		mockLogger = new MockLogger();
	});

	test("1. success path logs info with input and executionTime", async () => {
		const { UseCaseLogProxy } = await import(
			"../../../src/application/proxy/usecase-log.proxy"
		);
		proxy = new UseCaseLogProxy({
			useCase: mockUseCase,
			logger: mockLogger,
		});

		const input = { orderId: "ORDER-001" };
		const result = await proxy.execute(input);

		expect(result.success).toBe(true);
		expect(result.input).toEqual(input);
		expect(mockLogger.logs).toHaveLength(1);
		expect(mockLogger.logs[0]?.level).toBe("info");
		expect(mockLogger.logs[0]?.message).toBe("execute use case successfully");
		expect(mockLogger.logs[0]?.metadata?.input).toEqual(input);
		expect(mockLogger.logs[0]?.metadata?.executionTime).toMatch(/^\d+ms$/);
	});

	test("2. error path logs error with input, executionTime, and error", async () => {
		const { UseCaseLogProxy } = await import(
			"../../../src/application/proxy/usecase-log.proxy"
		);
		const errorMessage = "database connection failed";
		mockUseCase.setExecuteFn(async () => {
			throw new Error(errorMessage);
		});

		proxy = new UseCaseLogProxy({
			useCase: mockUseCase,
			logger: mockLogger,
		});

		const input = { orderId: "ORDER-001" };
		await expect(proxy.execute(input)).rejects.toThrow(errorMessage);

		expect(mockLogger.logs).toHaveLength(1);
		expect(mockLogger.logs[0]?.level).toBe("error");
		expect(mockLogger.logs[0]?.message).toBe("execute use case failed");
		expect(mockLogger.logs[0]?.metadata?.input).toEqual(input);
		expect(mockLogger.logs[0]?.metadata?.executionTime).toMatch(/^\d+ms$/);
		expect(mockLogger.logs[0]?.error).toBeInstanceOf(Error);
		expect(mockLogger.logs[0]?.error?.message).toBe(errorMessage);
	});

	test("3. executionTime is present and valid format on success", async () => {
		const { UseCaseLogProxy } = await import(
			"../../../src/application/proxy/usecase-log.proxy"
		);
		proxy = new UseCaseLogProxy({
			useCase: mockUseCase,
			logger: mockLogger,
		});

		await proxy.execute({ orderId: "ORDER-001" });

		const log = mockLogger.logs[0];
		expect(log?.metadata?.executionTime).toBeDefined();
		expect(typeof log?.metadata?.executionTime).toBe("string");
		expect(log?.metadata?.executionTime).toMatch(/^\d+ms$/);
	});

	test("4. executionTime is present and valid format on error", async () => {
		const { UseCaseLogProxy } = await import(
			"../../../src/application/proxy/usecase-log.proxy"
		);
		mockUseCase.setExecuteFn(async () => {
			throw new Error("fail");
		});

		proxy = new UseCaseLogProxy({
			useCase: mockUseCase,
			logger: mockLogger,
		});

		await expect(proxy.execute({ orderId: "ORDER-001" })).rejects.toThrow();

		const log = mockLogger.logs[0];
		expect(log?.metadata?.executionTime).toBeDefined();
		expect(typeof log?.metadata?.executionTime).toBe("string");
		expect(log?.metadata?.executionTime).toMatch(/^\d+ms$/);
	});

	test("5. inner use case is called with correct input", async () => {
		const { UseCaseLogProxy } = await import(
			"../../../src/application/proxy/usecase-log.proxy"
		);
		proxy = new UseCaseLogProxy({
			useCase: mockUseCase,
			logger: mockLogger,
		});

		const input = { orderId: "ORDER-002" };
		await proxy.execute(input);

		expect(mockUseCase.callCount).toBe(1);
		expect(mockUseCase.lastInput).toEqual(input);
	});
});
