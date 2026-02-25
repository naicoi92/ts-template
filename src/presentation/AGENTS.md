# PRESENTATION LAYER

HTTP interface: handlers, adapters, routes, factories. Transforms HTTP requests → domain commands, domain responses → HTTP responses.

## STRUCTURE

```
presentation/
├── handler/    # Request handlers (CreateInvoiceHandler)
├── adapter/    # Request adapters (FetchAdapter - validates & transforms)
├── factory/    # Response factories (ResponseFactory - consistent envelope)
└── routes/     # Route definitions (BunRoutes)
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add endpoint handler | `handler/*.handler.ts` |
| Add route | `routes/bun.routes.ts` |
| Add response type | `factory/response.factory.ts` |
| Add request adapter | `adapter/*.adapter.ts` |

## PATTERNS

### Handler Pattern
```typescript
// handler/create-invoice.handler.ts
export class CreateInvoiceHandler implements RequestHandler<TParams, TQuery, TBody> {
  readonly urlPattern = new URLPattern({ pathname: "/invoices" });
  readonly bodySchema = InvoiceCreateDtoSchema;  // Zod schema

  constructor(private readonly _deps: { useCase: CreateInvoiceUseCase; logger: Logger }) {}
  
  async handle(data: { body: TBody; request: Request }): Promise<Response> {
    const result = await this.useCase.execute(data.body);
    return ResponseFactory.created(result);
  }
}
```

### Adapter Pattern (Validation Layer)
```typescript
// adapter/fetch.adapter.ts
export class FetchAdapter<TParams, TQuery, TBody> implements FetchHandler {
  async handle(request: Request): Promise<Response> {
    // 1. Parse params, query, body using handler schemas
    // 2. Validate via Zod schemas (bodySchema, querySchema, paramsSchema)
    // 3. Call handler.handle({ request, params, query, body })
    // 4. Catch RequestValidationError → return 400
  }
}
```

### Response Factory
```typescript
// factory/response.factory.ts
// All responses use envelope pattern:
// Success: { success: true, data: T }
// Error:   { success: false, error: string, details?: ValidationErrorDetail[] }

ResponseFactory.created(data)      // 201 - POST success
ResponseFactory.success(data)      // 200 - GET success
ResponseFactory.notFound("Invoice") // 404
ResponseFactory.validationError(errors) // 400 with details
```

### Route Definition
```typescript
// routes/bun.routes.ts
export class BunRoutes implements BunRouter {
  get routes() {
    return {
      "/invoices": { POST: (req) => this.createInvoiceHandler.handle(req) },
    };
  }
}
```

## RULES

- **Use ResponseFactory** - Never construct Response directly in handlers
- **Validate via schemas** - Handler declares `bodySchema`/`querySchema`, adapter validates
- **Inject use cases** - Handlers depend on application layer, never infrastructure
- **URLPattern matching** - Each handler declares its own `urlPattern`
- **Private getters for deps** - Follow DI pattern: `private get logger() { return this._deps.logger; }`
