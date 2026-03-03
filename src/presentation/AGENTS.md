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

| Task | Location |
|------|----------|
| Add endpoint handler | `handler/*.handler.ts` |
| Add route | `routes/bun.routes.ts` |
| Add response rendering | `render/json.render.ts` |
| Add request adapter | `adapter/request.adapter.ts` |

## PATTERNS

### Handler Pattern
```typescript
// handler/create-invoice.handler.ts
export class CreateInvoiceHandler implements Handler<TResponse, TParams, TQuery, TBody> {
  readonly pathname = "/invoices";  // NOT urlPattern!
  readonly method = "POST";
  readonly bodySchema = InvoiceCreateDtoSchema;     // Zod schema
  readonly responseSchema = CreateInvoiceResponseSchema;

  constructor(private readonly _deps: { createInvoiceUseCase: CreateInvoiceUseCase; logger: Logger }) {}

  async handle(data: { body: TBody }): Promise<TResponse> {
    const invoice = await this.createInvoiceUseCase.execute(data.body);
    return {}; // Returns typed response, NOT Response object
  }
}
```

### Adapter Pattern (RequestAdapter)
```typescript
// adapter/request.adapter.ts
export class RequestAdapter<TResponse, TParams, TQuery, TBody>
  implements RequestHandler<Request, Response> {

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
      ])
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
