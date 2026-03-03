Plan: Update request.adapter.ts to validate inputs/outputs with Zod at runtime
- Actions taken:
  1) Swapped Zod import from type-only to runtime import: import z from 'zod'.
  2) Added ValidationErrorSource type import and formatZodError helper usage.
  3) Extended schemaParse signature to accept a source (params|query|body) and throw RequestValidationError with formatted details when parsing fails.
  4) Updated all parse calls (params, query, body) to pass the corresponding source.
  5) Implemented post-handler output validation when a handler defines a responseSchema:
     - Only validate when response is JSON and status != 204
     - Validate envelope { success: boolean, data: T } using Zod
     - Throw ZodError on mismatch to be mapped to 500 by global error handler
  6) Ensured to preserve original Response object when returning to caller

- Verification done:
  - bun run typecheck passes (no TS errors)
  - No changes to request DTOs; only validation layer adjustments
  - Tests can verify that validation errors include details via 400 response

- Next steps (if needed):
  - Add tests for envelope validation failure
  - Extend error mapping for ZodError on response envelope to include details
