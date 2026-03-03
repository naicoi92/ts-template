# TESTS

Bun test runner. Mirrors src structure. Mocks for interfaces, fixtures for test data.

## STRUCTURE

```
tests/
├── mocks/         # Mock implementations of domain interfaces
├── fixtures/      # Test data builders (InvoiceFixture, CustomerFixture)
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

### Mock Pattern
```typescript
// mocks/repository.mock.ts
export class MockInvoiceRepository implements InvoiceRepository {
  findByOrderId = jest.fn<(orderId: string) => Promise<Invoice | null>>();
  create = jest.fn<(data: InvoiceCreateDto) => Promise<Invoice>>();
}
```

### Fixture Pattern
```typescript
// fixtures/invoice.fixture.ts
export class InvoiceFixture {
  static build(overrides?: Partial<InvoiceDto>): InvoiceDto {
    return {
      id: "inv_123",
      orderId: "ord_123",
      amount: 1000,
      ...overrides,
    };
  }
}
```

### Test Structure
```typescript
// domain/entity/invoice.entity.test.ts
import { test, expect, describe } from "bun:test";
import { InvoiceFixture } from "tests/fixtures";

describe("Invoice", () => {
  test("validates orderId is required", () => {
    expect(() => new Invoice(InvoiceFixture.build({ orderId: "" })))
      .toThrow("orderId required");
  });
});
```

## CONVENTIONS

- **Mirror src structure**: `tests/domain/entity/` tests `src/domain/entity/`
- **One test file per source file**: `invoice.entity.test.ts` tests `invoice.entity.ts`
- **Use fixtures**: Don't inline test data, use fixture builders
- **Mock interfaces**: Mock domain interfaces, never infrastructure classes

## COMMANDS

```bash
bun test                        # Run all tests
bun test tests/domain           # Run domain tests only
bun test --watch                # Watch mode
```
