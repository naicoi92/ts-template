# Learnings: Clean Response Architecture

## 2026-03-21: ErrorSerializer Refactor

### Pattern: ErrorSerializer in Presentation Layer
- Domain errors should NOT know about JSON serialization (Clean Architecture principle)
- `ErrorSerializer` class belongs to presentation layer (`src/presentation/render/`)
- Domain errors expose raw data via public readonly properties
- Presentation layer decides what to serialize and how

### Whitelist Pattern for Security
- `ServiceUnhealthyError` serialization: ONLY expose `status` and `timestamp`
- HIDE `error` and `details` fields (internal diagnostics, may contain sensitive info)
- This prevents leaking DB connection strings, passwords, internal errors to clients

### ErrorMapper Pattern
- Uses `instanceof` checks instead of duck-typing (`hasToJson()`)
- Delegates serialization to `ErrorSerializer` (single responsibility)
- Structure:
  ```typescript
  if (error instanceof RequestValidationError) {
    body.error.details = this.serializer.serializeValidation(error);
  } else if (error instanceof ServiceUnhealthyError) {
    body.error.details = this.serializer.serializeHealth(error);
  }
  ```

### File Organization
- `src/presentation/render/error.serializer.ts` - ErrorSerializer class
- `src/presentation/render/error.mapper.ts` - ErrorMapper uses serializer
- `src/presentation/render/index.ts` - exports both
- Domain errors: `src/domain/error/*.error.ts` - NO toJSON() methods
