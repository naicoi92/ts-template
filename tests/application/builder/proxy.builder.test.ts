import { describe, expect, test } from "bun:test";
import { ProxyBuilder } from "../../../src/application/builder/proxy.builder";
import type { UseCase } from "../../../src/domain/interface/usecase.interface";

// --- Test helpers: proxies that record wrapping order ---

interface TrackedTarget {
	readonly callStack: string[];
}

class BaseTarget implements TrackedTarget {
	readonly callStack: string[] = ["base"];
}

class TrackedProxyA implements TrackedTarget {
	constructor(private readonly _inner: TrackedTarget) {}
	get callStack() {
		return ["A", ...this._inner.callStack];
	}
}

class TrackedProxyB implements TrackedTarget {
	constructor(private readonly _inner: TrackedTarget) {}
	get callStack() {
		return ["B", ...this._inner.callStack];
	}
}

// Proxy with deps
class TrackedProxyWithDeps implements TrackedTarget {
	constructor(
		private readonly _inner: TrackedTarget,
		private readonly _label: string,
	) {}
	get callStack() {
		return [this._label, ...this._inner.callStack];
	}
}

// --- UseCase-compatible target for type preservation test ---

interface TestInput {
	readonly orderId: string;
}

interface TestOutput {
	readonly invoiceId: number;
}

class PlainUseCase implements UseCase<TestInput, TestOutput> {
	async execute(input: TestInput): Promise<TestOutput> {
		return { invoiceId: Number.parseInt(input.orderId.split("-")[1] ?? "0") };
	}
}

class UseCaseProxy
	implements UseCase<TestInput, TestOutput>
{
	constructor(private readonly _inner: UseCase<TestInput, TestOutput>) {}
	async execute(input: TestInput): Promise<TestOutput> {
		return this._inner.execute(input);
	}
}

describe("ProxyBuilder", () => {
	test("empty builder returns original target", () => {
		const target = new BaseTarget();
		const result = new ProxyBuilder(target).build();

		expect(result).toBe(target);
		expect(result.callStack).toEqual(["base"]);
	});

	test("single proxy wraps correctly", () => {
		const target = new BaseTarget();
		const result = new ProxyBuilder(target)
			.withProxy(TrackedProxyA)
			.build();

		expect(result).toBeInstanceOf(TrackedProxyA);
		expect(result.callStack).toEqual(["A", "base"]);
	});

	test("composition order is inner → outer", () => {
		// .withProxy(A).withProxy(B) = B(A(target))
		const target = new BaseTarget();
		const result = new ProxyBuilder(target)
			.withProxy(TrackedProxyA)
			.withProxy(TrackedProxyB)
			.build();

		expect(result).toBeInstanceOf(TrackedProxyB);
		expect(result.callStack).toEqual(["B", "A", "base"]);
	});

	test("type preservation — ProxyBuilder<UseCase<A,B>> returns correctly typed UseCase", async () => {
		const target: UseCase<TestInput, TestOutput> = new PlainUseCase();

		const composed: UseCase<TestInput, TestOutput> = new ProxyBuilder(target)
			.withProxy(UseCaseProxy)
			.build();

		const output = await composed.execute({ orderId: "INV-42" });
		expect(output).toEqual({ invoiceId: 42 });
	});

	test("repeated build() returns same instance", () => {
		const target = new BaseTarget();
		const builder = new ProxyBuilder(target).withProxy(TrackedProxyA);

		const first = builder.build();
		const second = builder.build();

		expect(first).toBe(second);
	});
});

describe("ProxyBuilder with deps", () => {
	test("passes deps to proxy constructor", () => {
		const target = new BaseTarget();
		const result = new ProxyBuilder(target)
			.withProxy(TrackedProxyWithDeps, "DEPS")
			.build();

		expect(result.callStack).toEqual(["DEPS", "base"]);
	});
});
