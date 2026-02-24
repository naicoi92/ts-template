# DOMAIN LAYER

Core business logic. Framework-agnostic. Zero external dependencies on infrastructure.

## STRUCTURE

```
domain/
├── entity/      # Domain entities with validation (Invoice, Customer)
├── interface/   # Repository contracts, Logger, Server, Config interfaces
├── type/        # DTOs, type aliases (InvoiceDto, InvoiceCreateInput)
├── schema/      # Zod validation schemas
├── error/       # Domain-specific errors (InvoiceAmountMisMatch)
└── enum/        # Domain enums (LoggerType)
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
export class Invoice {
  constructor(private _data: InvoiceSelectDto) {
    this.validate(); // Always validate in constructor
  }
  private validate() {
    if (!this._data.orderId) throw new Error("orderId required");
  }
  get id() { return this._data.id; }  // Expose via getters
}
```

### Repository Interface
```typescript
// interface/invoice-repository.interface.ts
export interface InvoiceRepository {
  findByOrderId(orderId: string): Promise<Invoice | null>;
  create(data: InvoiceCreateDto): Promise<Invoice>;
}
```

### DTO Naming
- `*Dto` - Data transfer object (e.g., `InvoiceDto`)
- `*SelectDto` - Database select shape (e.g., `InvoiceSelectDto`)
- `*CreateInput` - API input (e.g., `InvoiceCreateInput`)

### Domain Errors
```typescript
// error/invoice.error.ts
export class InvoiceAmountMisMatch extends Error {
  constructor(orderId: string, expected: number, actual: number) {
    super(`Invoice ${orderId}: expected ${expected}, got ${actual}`);
  }
}
```

## RULES

- **No infrastructure imports** - Domain never imports from `infrastructure/` or `presentation/`
- **Validate in constructor** - Entities must be valid after creation
- **Immutable via getters** - No public setters on entities
- **Interface suffix** - Files end with `.interface.ts`, exports match (e.g., `Logger` from `logger.interface.ts`)
