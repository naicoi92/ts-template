# PRESENTATION LAYER

HTTP interface: handlers, adapters, routes, render. Transforms HTTP requests → domain commands, domain responses → HTTP responses.

## STRUCTURE

```
presentation/
├── handler/    # Request handlers (CreateInvoiceHandler, GetInvoiceHandler)
├── adapter/    # RequestAdapter - validates & transforms requests
├── render/     # JsonRender - response rendering
├── routes/     # BunRoutes - route registration
└── error/      # Presentation-specific errors (InvalidRequestMethodError)
```

## WHERE TO LOOK

| Task                   | Location                     |
| ---------------------- | ---------------------------- |
| Add endpoint handler   | `handler/*.handler.ts`       |
| Add route              | `routes/bun.routes.ts`       |
| Add response rendering | `render/json.render.ts`      |
| Add request adapter    | `adapter/request.adapter.ts` |

## PATTERNS

### Handler Pattern (with UseCaseCompositionBuilder)

```typescript
// handler/create-invoice.handler.ts
export class CreateInvoiceHandler implements Handler<TResponse, TParams, TQuery, TBody> {
	readonly pathname = "/invoices";
	readonly method = "POST";
	readonly bodySchema = InvoiceCreateDtoSchema;
	readonly responseSchema = CreateInvoiceResponseSchema;

	constructor(
		private readonly _deps: {
			logger: Logger;
			invoiceRepository: InvoiceRepository;
			customerRepository: CustomerRepository;
			invoiceCodeGenerator: InvoiceCodeGenerator;
			partnerRepository: PartnerRepository;
			signatureVerifier: SignatureVerifier;
		},
	) {}

	async handle(data: RequestData<TParams, TQuery, TBody>): Promise<TResponse> {
		// 1. Create auth context from request
		const authContext = new PartnerRequestAuthContextFactory().create({
			headers: data.headers,
			method: this.method,
			pathname: this.pathname,
			data: data.body,
		});

		// 2. Create per-request cached repository (if needed)
		const cachedCustomerRepository = new CachedCustomerRepositoryFactory().create(
			this.customerRepository,
		);

		// 3. Create base use case
		const baseUseCase = new CreateInvoiceUseCase({
			logger: this.logger.withTraceId("cinv"),
			invoiceRepository: this.invoiceRepository,
			customerRepository: cachedCustomerRepository,
			invoiceCodeGenerator: this.invoiceCodeGenerator,
		});

		// 4. Build decorated use case chain
		const useCase = new UseCaseCompositionBuilder(baseUseCase)
			.withPartnerAuthentication(authContext, this.partnerRepository, this.signatureVerifier)
			.withLogging(this.logger.withTraceId("cinv"))
			.build();

		// 5. Execute and return
		return await useCase.execute(data.body);
	}
}
```

### Legacy Handler Pattern (without composition builder)

```typescript
// handler/simple-handler.handler.ts
export class SimpleHandler implements Handler<TResponse, TParams, TQuery, TBody> {
	readonly pathname = "/simple";
	readonly method = "POST";
	readonly bodySchema = SimpleDtoSchema;
	readonly responseSchema = SimpleResponseSchema;

	constructor(private readonly _deps: { simpleUseCase: SimpleUseCase }) {}

	async handle(data: { body: TBody }): Promise<TResponse> {
		const result = await this.simpleUseCase.execute(data.body);
		return result;
	}
}
```

### Adapter Pattern (RequestAdapter)

```typescript
// adapter/request.adapter.ts
export class RequestAdapter<TResponse, TParams, TQuery, TBody> implements RequestHandler<
	Request,
	Response
> {
	async handle(request: Request): Promise<Response> {
		// 1. Check method matches handler.method
		// 2. Parse params via URLPattern from handler.pathname
		// 3. Parse query/body via Zod schemas
		// 4. Call handler.handle({ params, query, body })
		// 5. Validate response via handler.responseSchema
		// 6. Return render.data(response) or render.error(error)
	}
}
```

### Render Pattern

```typescript
// render/json.render.ts
export class JsonRender<I = void> implements ResponseRender<I, Response> {
	data(data: I): Promise<Response> {
		return Promise.resolve(Response.json(data));
	}

	error(error: unknown): Promise<Response> {
		// Currently logs and throws "Method not implemented"
		// TODO: Implement proper error responses
	}
}
```

### Route Definition

```typescript
// routes/bun.routes.ts
export class BunRoutes {
	constructor(private _deps: { handlers: Handler[]; logger: Logger }) {}

	get routes() {
		// Maps each handler.pathname to RequestAdapter
		return fromPairs(
			map(this.handlers, (handler) => [
				handler.pathname,
				(request: Request) => this.createAdapter(handler).handle(request),
			]),
		);
	}
}
```

## RULES

- **Handler returns typed data** - NOT Response object, render handles that
- **Each pathname must be unique** - BunRoutes maps one handler per path
- **Validate via schemas** - Handler declares `bodySchema`/`querySchema`/`paramsSchema`/`responseSchema`
- **Inject use cases** - Handlers depend on application layer, never infrastructure
- **Private getters for deps** - Follow DI pattern: `private get logger() { return this._deps.logger; }`
