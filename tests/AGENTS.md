# TESTS

Bun test runner. Mirrors src structure. Class-based mocks, exported fixture objects.

## STRUCTURE

```
tests/
├── mocks/         # Mock implementations of domain interfaces
├── fixtures/      # Test data objects (invoiceFixtures, customerFixtures)
├── domain/        # Domain entity tests
├── application/   # Use case tests
└── presentation/  # Handler and adapter tests
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add entity test | `tests/domain/entity/*.test.ts` |
| Add use case test | `tests/application/use-case/*.test.ts` |
| Add handler test | `tests/presentation/handler/*.test.ts` |
| Add mock | `tests/mocks/*.mock.ts` |
| Add fixture | `tests/fixtures/*.fixture.ts` |

## PATTERNS

### Mock Pattern (Class-based)
```typescript
// mocks/repository.mock.ts
export class MockInvoiceRepository implements InvoiceRepository {
  private invoices: Map<string, Invoice> = new Map();
  private nextId = 1;

  async findByOrderId(orderId: string): Promise<Invoice> {
    const invoice = this.invoices.get(orderId);
    if (!invoice) throw new InvoiceNotFoundError(orderId);
    return invoice;
  }

  async create(data: InvoiceCreateDto): Promise<Invoice> {
    // Build and store invoice
  }

  reset(): void {
    this.invoices.clear();
    this.nextId = 1;
  }

  seedInvoice(invoice: Invoice): void {
    this.invoices.set(invoice.orderId, invoice);
  }
}
```

### Fixture Pattern (Exported Objects)
```typescript
// fixtures/invoice.fixture.ts
export const invoiceFixtures = {
  complete: (): InvoiceSelectDto => ({
    invoiceId: 1,
    code: "INV-2024-001",
    customerId: 1,
    email: "customer@example.com",
    orderId: "ORDER-001",
    amount: 100000,
    status: InvoiceStatus.PENDING,
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z"),
  }),

  minimal: (): InvoiceSelectDto => ({
    orderId: "ORDER-MINIMAL",
    email: "minimal@example.com",
    amount: 50000,
  }),
};
```

### Test Structure
```typescript
// domain/entity/invoice.entity.test.ts
import { describe, expect, test } from "bun:test";
import { InvoiceFieldNotFoundError } from "../../../src/domain/error";
import { invoiceFixtures } from "../../fixtures";

describe("Invoice Entity", () => {
  describe("getters", () => {
    test("should throw InvoiceFieldNotFoundError when invoiceId is missing", () => {
      const data = invoiceFixtures.minimal();
      const invoice = new Invoice(data);

      expect(() => invoice.invoiceId).toThrow(InvoiceFieldNotFoundError);
    });
  });
});
```

## CONVENTIONS

- **Mirror src structure**: `tests/domain/entity/` tests `src/domain/entity/`
- **One test file per source file**: `invoice.entity.test.ts` tests `invoice.entity.ts`
- **Use fixtures**: Don't inline test data, use exported fixture objects
- **Mock interfaces**: Mock domain interfaces with class-based mocks that have `reset()` and `seed*()` helpers

## COMMANDS

```bash
bun test                        # Run all tests
bun test tests/domain           # Run domain tests only
bun test --watch                # Watch mode
```
