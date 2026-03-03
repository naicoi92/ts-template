# DOMAIN LAYER

Core business logic. Framework-agnostic. Zero external dependencies on infrastructure.

## STRUCTURE

```
domain/
├── entity/      # Domain entities (Invoice, Customer)
├── interface/   # Repository contracts, Logger, Server, Config, Handler
├── type/        # DTOs, type aliases (InvoiceSelectDto, InvoiceCreateDto)
├── schema/      # Zod validation schemas (env, invoice, customer)
├── error/       # Domain-specific errors (InvoiceNotFoundError, InvoiceFieldNotFoundError)
└── enum/        # Domain enums (InvoiceStatus, LogLevel)
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Define business entity | `entity/*.entity.ts` |
| Define repository contract | `interface/*-repository.interface.ts` |
| Define input/output types | `type/*.type.ts` |
| Add validation schema | `schema/*.schema.ts` |
| Add domain error | `error/*.error.ts` |

## PATTERNS

### Entity
```typescript
// entity/invoice.entity.ts
// Entities accept partial DTOs, getters enforce required fields
export class Invoice {
  constructor(private _data: InvoiceSelectDto) {} // No validate() call

  get invoiceId(): number {
    if (!this._data.invoiceId) throw new InvoiceFieldNotFoundError("invoiceId");
    return this._data.invoiceId;
  }
}
```

### Repository Interface
```typescript
// interface/invoice-repository.interface.ts
export interface InvoiceRepository {
  findByOrderId(orderId: string): Promise<Invoice>; // Throws InvoiceNotFoundError
  create(data: InvoiceCreateDto): Promise<Invoice>;
}
```

### DTO Naming
- `*SelectDto` - Database select shape (e.g., `InvoiceSelectDto`) - may be partial
- `*CreateDto` - Create input (e.g., `InvoiceCreateDto`)
- `*Response` - API response (e.g., `CreateInvoiceResponse`)

### Domain Errors
```typescript
// error/entity-validation.error.ts
export class InvoiceFieldNotFoundError extends Error {
  constructor(field: string) {
    super(`Invoice field not found: ${field}`);
  }
}

// error/invoice.error.ts
export class InvoiceNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Invoice not found: ${orderId}`);
  }
}

export class InvoiceAmountMisMatch extends Error {
  constructor(orderId: string, expected: number, actual: number) {
    super(`Invoice ${orderId}: expected ${expected}, got ${actual}`);
  }
}
```

## RULES

- **No infrastructure imports** - Domain never imports from `infrastructure/` or `presentation/`
- **Getters throw domain errors** - Accessing missing fields throws `*FieldNotFoundError`
- **Repositories throw not return null** - Use `*NotFoundError` instead of returning null
- **Immutable via getters** - No public setters on entities
- **Interface suffix** - Files end with `.interface.ts`, exports match (e.g., `Logger` from `logger.interface.ts`)
