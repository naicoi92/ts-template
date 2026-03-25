# APPLICATION LAYER

Use cases orchestrate business rules. Domain-agnostic application logic.

## STRUCTURE

```
application/
├── use-case/   # Business use cases (CreateInvoiceUseCase, GetInvoiceUseCase)
└── proxy/      # Use case proxies (UseCaseLogProxy - logging decorator)
```

## WHERE TO LOOK

| Task                  | Location                 |
| --------------------- | ------------------------ |
| Add business use case | `use-case/*.use-case.ts` |
| Add cross-cutting     | `proxy/*.proxy.ts`       |

## PATTERNS

### Use Case

```typescript
// use-case/create-invoice.use-case.ts
export class CreateInvoiceUseCase implements UseCase<Input, Output> {
	constructor(
		private _deps: {
			logger: Logger;
			invoiceRepository: InvoiceRepository;
			customerRepository: CustomerRepository;
			invoiceCodeGenerator: InvoiceCodeGenerator;
		},
	) {}

	async execute(input: Input): Promise<Output> {
		// Orchestrate domain objects
	}

	private get logger(): Logger {
		return this._deps.logger;
	}
}
```

### Proxy Pattern (Logging Decorator)

```typescript
// proxy/usecase-log.proxy.ts
export class UseCaseLogProxy<I, O> implements UseCase<I, O> {
	constructor(private deps: { useCase: UseCase<I, O>; logger: Logger }) {}

	async execute(input: I): Promise<O> {
		const start = Date.now();
		try {
			const result = await this.useCase.execute(input);
			this.logger.withData({ executionTime: `${Date.now() - start}ms` }).info("success");
			return result;
		} catch (error) {
			this.logger.withError(error).error("failed");
			throw error;
		}
	}
}
```

## RULES

- **Implement UseCase interface** - All use cases implement `UseCase<I, O>` from domain
- **Inject domain interfaces** - Never import infrastructure implementations
- **Private getters for deps** - `private get logger() { return this._deps.logger; }`
- **Return DTOs, not entities** - Use `to*OutputDto()` methods for transformation
- **Proxies are decorators** - Use proxy pattern for cross-cutting (logging, timing, caching)

## Builder Pattern

```typescript
// src/application/builder/invoice.builder.ts
export class InvoiceBuilder {
	private _data: InvoiceDto = {};

	setOrderId(orderId: string): this {
		this._data.orderId = orderId;
		return this;
	}

	build(): Invoice {
		return new Invoice(this._data);
	}
}
```

### ProxyBuilder Pattern

**Generic Builder Usage**

The `ProxyBuilder<T>` pattern provides a fluent interface for decorating use cases and repositories with cross-cutting concerns.

**Constructor Signature Pattern:**

```typescript
new ProxyBuilder<UseCase<Input, Output>>(baseUseCase)
	.withLogging(logger)
	.withCaching(cacheStore)
	.build();
```

**Use Case Example:**

```typescript
// src/application/proxy/use-case-log.proxy.ts
export class UseCaseLogProxy<I, O> implements UseCase<I, O> {
	constructor(private deps: { useCase: UseCase<I, O>; logger: Logger }) {}

	async execute(input: I): Promise<O> {
		const start = Date.now();
		try {
			const result = await this.useCase.execute(input);
			this.deps.logger.withData({ executionTime: `${Date.now() - start}ms` }).info("success");
			return result;
		} catch (error) {
			this.deps.logger.withError(error).error("failed");
			throw error;
		}
	}
}
```

**Repository Example:**

```typescript
// src/application/proxy/repository-cache.proxy.ts
export class RepositoryCacheProxy<R extends Repository> implements Repository<R> {
	constructor(private deps: { repository: R; cacheStore: CacheStore }) {}

	async execute(input: any): Promise<any> {
		const cacheKey = this.generateCacheKey(input);
		const cached = await this.cacheStore.get(cacheKey);
		if (cached) return cached;

		const result = await this.repository.execute(input);
		await this.cacheStore.set(cacheKey, result);
		return result;
	}
}
```

**Inner→Outer Semantics:**

- **Inner**: Base component (use case or repository)
- **Outer**: Decorated component with added behavior
- **Semantics**: Outer layer wraps inner, allowing cross-cutting concerns to be added incrementally

**Fluent Interface:**

- Each builder method returns `this` for chaining
- `build()` returns the final decorated component
- Methods like `withLogging`, `withCaching`, `withAuthentication` can be added in any order

**Constructor Pattern:**

```typescript
class ProxyBuilder<T> {
	private _component: T;
	constructor(component: T) {
		this._component = component;
	}
	withLogging(logger: Logger): this {
		// add logging behavior
		return this;
	}
	withCaching(cacheStore: CacheStore): this {
		// add caching behavior
		return this;
	}
	build(): T {
		// return decorated component
		return this._component;
	}
}
```
