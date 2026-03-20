# APPLICATION LAYER

Use cases orchestrate business rules. Domain-agnostic application logic.

## STRUCTURE

```
application/
├── use-case/   # Business use cases (CreateInvoiceUseCase, GetInvoiceUseCase)
└── proxy/      # Use case proxies (UseCaseLogProxy - logging decorator)
```

## WHERE TO LOOK

| Task                  | Location                             |
| --------------------- | ------------------------------------ |
| Add business use case | `use-case/*.use-case.ts`             |
| Add cross-cutting     | `proxy/*.proxy.ts`                   |

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

	private get logger(): Logger { return this._deps.logger; }
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
