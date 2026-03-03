# Clean Response Architecture (Keep Existing Envelope)

## TL;DR
> **Summary**: Refactor response/error handling để đúng Clean Architecture hơn bằng cách loại HTTP concerns khỏi `src/domain/` và centralize error → HTTP response mapping, giữ nguyên JSON envelope hiện tại.
> **Deliverables**: Domain không còn `Response`/HTTP handler interfaces; validation errors luôn ra `400` với `details`; domain/presentation errors luôn ra envelope thống nhất; test coverage cho response factory + adapter/error mapping.
> **Effort**: Medium
> **Parallel**: YES - 2 waves
> **Critical Path**: Move HTTP interfaces out of domain → Central error handler/presenter → Wire into RequestAdapter/BunRoutes → Tests + verification

## Context
### Original Request
- "tôi không hài lòng với Response hiện tại. tôi muốn phương án clean architecture hơn."

### Interview Summary
- Quyết định: **giữ nguyên API response envelope hiện tại** (`success/data` và `success/error/details?`), chỉ refactor kiến trúc + error mapping.

### Metis Review (gaps addressed)
- Fix bug: `RequestAdapter.schemaParse()` đang throw raw `ZodError` → validation errors không được map thành response 400.
- Domain layer đang chứa HTTP concerns (`Response`, handler interfaces) → vi phạm Clean Architecture.
- `ErrorHandlerMiddleware` tồn tại nhưng không wired vào request flow + dependency direction lẫn (infrastructure import presentation).
- Bổ sung test bắt buộc: ResponseFactory + RequestAdapter/error mapping.

## Work Objectives
### Core Objective
- Làm response handling “clean” hơn bằng cách:
  - Domain không chứa HTTP types/handler contracts.
  - Một điểm trung tâm map mọi error (domain + presentation) → HTTP Response theo envelope hiện tại.
  - Request validation trả về `400` có `details` nhất quán.

### Deliverables
- Di chuyển HTTP handler interfaces khỏi `src/domain/interface/request-handler.interface.ts` sang presentation layer.
- Handler có thể khai báo `responseSchema` (Zod) để validate output response (success envelope) ở RequestAdapter.
- Thêm error handler/presenter ở presentation để map errors → `ResponseFactory.*`.
- Wire error handler vào request flow (RequestAdapter/BunRoutes) để **không còn unhandled errors**.
- Tests mới/được cập nhật để khoá contract:
  - ResponseFactory statuses + envelope shape
  - RequestAdapter: validation errors, invalid body/method, domain errors

### Definition of Done (agent-verifiable)
- `bun test` pass.
- `bun run typecheck` pass.
- `bun run lint` pass.
- Không còn file nào trong `src/domain/` export/import `Response` hoặc HTTP handler interfaces.
- Validation errors (params/query/body) luôn trả về `400` với `{ success: false, error: "Validation failed", details: [...] }`.
- Domain errors (ví dụ `InvoiceNotFoundError`, `InvoiceAmountMisMatch`) luôn trả về response envelope tương ứng (404/409) thay vì crash.
- Nếu handler khai báo `responseSchema`, output success response được validate (schema fail → 500 envelope + log).

### Must Have
- Giữ nguyên JSON envelope hiện tại (không breaking change).
- Centralize error mapping, không duplicate ở nhiều nơi.
- Không thêm dependency mới.

### Must NOT Have (guardrails)
- Không đổi business rules của invoice/customer.
- Không đổi database schema/repositories behavior (ngoại trừ thay đổi error mapping đã có).
- Không đổi endpoints/paths/methods.
- Không đổi response shape cho success/error.

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: tests-after (bun:test)
- QA policy: Mỗi task có QA scenarios (happy + failure)
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
Wave 1 (foundation): interface move + error presenter + adapter wiring
Wave 2 (stabilize): tests + repo-wide verification

### Dependency Matrix (full)
- Task 1 blocks Task 4/5/6 (imports depend on new interface location)
- Task 2 blocks Task 4/6 (error mapping must exist before wiring/tests)
- Task 3 blocks Task 4/6 (validation fix affects wiring/tests)
- Task 4 blocks Task 6 (end-to-end response behavior)
- Task 5 depends on Tasks 2-4
- Task 6 depends on Tasks 1-5

### Agent Dispatch Summary
- Wave 1: 4 tasks (unspecified-high/quick)
- Wave 2: 2 tasks (writing/unspecified-high)

## TODOs

- [ ] 1. Move HTTP handler contracts out of domain

  **What to do**:
  - Create new presentation-level interface file (decision-complete path): `src/presentation/interface/http-handler.interface.ts` containing:
    - `Handler<TParams, TQuery, TBody, TResponse = unknown>` với property mới:
      - `readonly responseSchema?: z.ZodSchema<TResponse>` (validate success response `data`)
    - `RequestHandler`
    - `RequestData<TParams, TQuery, TBody>`
  - Move (or re-home) content from `src/domain/interface/request-handler.interface.ts` to the new file.
  - Update exports:
    - Remove request-handler export from `src/domain/interface/index.ts`.
    - Create `src/presentation/interface/index.ts` exporting `Handler`, `RequestHandler`, `RequestData`.
    - Update `src/presentation/index.ts` to export `* from "./interface"`.
  - Update all imports that currently reference `Handler`/`RequestHandler` from `../../domain/interface` to instead reference presentation interface barrel/path.

  **Must NOT do**:
  - Do not change handler method signatures (keep returning `Promise<Response>` for now).
  - Do not introduce framework types into domain.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: cross-file refactor with type ripples
  - Skills: [`clean-architecture`] — ensure dependency direction stays sane
  - Omitted: [`git-master`] — not needed unless committing

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 4, 5, 6 | Blocked By: none

  **References**:
  - Existing contract: `src/domain/interface/request-handler.interface.ts`
  - Import hotspots: `src/presentation/adapter/request.adapter.ts`, `src/presentation/routes/bun.routes.ts`, `src/presentation/handler/*.handler.ts`

  **Acceptance Criteria**:
  - [ ] `src/domain/interface/index.ts` no longer exports request handler types
  - [ ] No file under `src/domain/` mentions `Response` in exported interfaces
  - [ ] `bun run typecheck` passes

  **QA Scenarios**:
  ```
  Scenario: Type ripple check
    Tool: Bash
    Steps: bun run typecheck
    Expected: exits 0
    Evidence: .sisyphus/evidence/task-1-typecheck.txt

  Scenario: Domain purity spot-check
    Tool: Bash
    Steps: grep -R "Promise<Response>" src/domain || true
    Expected: no matches
    Evidence: .sisyphus/evidence/task-1-domain-promise-response-grep.txt
  ```

  **Commit**: YES | Message: `refactor(presentation): move http handler interfaces out of domain` | Files: `src/domain/interface/index.ts`, `src/domain/interface/request-handler.interface.ts`, `src/presentation/interface/http-handler.interface.ts`, import updates


- [ ] 2. Introduce presentation error handler/presenter for HTTP responses

  **What to do**:
  - Create `src/presentation/middleware/error-handler.middleware.ts` that:
    - Accepts `logger: Logger` (from `src/domain/interface/logger.interface.ts`) in constructor.
    - Exposes `handle(error: unknown, request?: Request): Response`.
    - Maps known errors to ResponseFactory:
      - `RequestValidationError` → `ResponseFactory.validationError(error.errors)`
      - `InvalidRequestMethodError` → `ResponseFactory.error("Method not allowed", 405)`
      - `InvalidJsonBodyError` / `InvalidTextBodyError` → `ResponseFactory.badRequest("Invalid request body")`
      - `InvoiceNotFoundError` → `ResponseFactory.notFound("Invoice")`
      - `CustomerNotFoundError` → `ResponseFactory.notFound("Customer")`
      - `InvoiceAmountMisMatch` → `ResponseFactory.conflict(error.message)`
      - `SyntaxError` → `ResponseFactory.badRequest("Invalid JSON body")`
      - Unknown → `ResponseFactory.internalError()` (generic message; log full error)
  - Move and replace the existing infra middleware:
    - Source: `src/infrastructure/middleware/error-handler.middleware.ts`
    - Target: the new presentation file
    - Ensure infrastructure no longer imports from presentation.
  - Delete unused infra middleware barrel export file: `src/infrastructure/middleware/index.ts`.
  - Create `src/presentation/middleware/index.ts` exporting `ErrorHandlerMiddleware`.
  - Update `src/presentation/index.ts` to export `* from "./middleware"`.

  **Must NOT do**:
  - Do not change ResponseFactory envelope.
  - Do not leak internal error messages in production path; default to generic internal error message.

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: localized implementation + moving file
  - Skills: [`clean-code`] — keep mapping straightforward

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4, 5 | Blocked By: none

  **References**:
  - Current mapping logic: `src/infrastructure/middleware/error-handler.middleware.ts`
  - Response creation: `src/presentation/factory/response.factory.ts`
  - Presentation errors: `src/presentation/error/request-adapter.error.ts`
  - Domain errors: `src/domain/error/*.ts`

  **Acceptance Criteria**:
  - [ ] Error handler class exists in `src/presentation/` and compiles
  - [ ] `src/infrastructure/middleware/error-handler.middleware.ts` is removed or no longer used

  **QA Scenarios**:
  ```
  Scenario: Map InvoiceNotFoundError -> 404 envelope
    Tool: Bun test
    Steps: Run targeted tests added in Task 5
    Expected: response.status=404; json.success=false; json.error contains "not found"
    Evidence: .sisyphus/evidence/task-2-notfound-mapping.txt

  Scenario: Unknown error -> 500 envelope
    Tool: Bun test
    Steps: Run targeted tests added in Task 5
    Expected: response.status=500; json.success=false; json.error is generic
    Evidence: .sisyphus/evidence/task-2-unknown-mapping.txt
  ```

  **Commit**: YES | Message: `refactor(presentation): centralize error-to-response mapping` | Files: new/modified presentation error handler + removal of infra middleware


- [ ] 3. Fix RequestAdapter input validation + validate handler success output (responseSchema)

  **What to do**:
  - Update `src/presentation/adapter/request.adapter.ts`:
    - Change Zod import to runtime (needed for output validation): replace `import type z from "zod";` with `import z from "zod";`.
    - Change `schemaParse()` so it **never throws raw ZodError**.
    - For each parse site, pass source explicitly:
      - params → source `"params"`
      - query → source `"query"`
      - body → source `"body"`
    - When `safeParse` fails, throw `new RequestValidationError(formatZodError(result.error, source))`.
    - Ensure nested paths produce `field` using existing `formatZodError` behavior.
    - After calling handler:
      - `const response = await this.handler.handle({ params, query, body })`
      - If `this.handler.responseSchema` is defined:
        - Only validate JSON success responses:
          - Skip if `response.status === 204`.
          - Skip unless `response.headers.get("content-type")?.includes("application/json")`.
        - Clone and parse JSON without consuming the original body: `const json = await response.clone().json()`.
        - Validate the **success envelope** shape: `z.object({ success: z.literal(true), data: this.handler.responseSchema })`.
        - If validation fails: throw the ZodError (it will be caught and mapped to 500 envelope by the central error handler).
      - Return the original `response`.
  - Ensure request body parsing errors use the presentation errors already defined.

  **Must NOT do**:
  - Do not change schemas or DTOs.
  - Do not add zod formatting logic in multiple places (reuse `formatZodError`).
  - Do not validate error envelopes here (output schema applies to success `data` only).

  **Recommended Agent Profile**:
  - Category: `quick` — Reason: single-file correctness fix
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 4, 5 | Blocked By: none

  **References**:
  - Adapter: `src/presentation/adapter/request.adapter.ts`
  - Error type + formatter: `src/domain/error/validation.error.ts`
  - Details type: `src/domain/type/validation.type.ts`

  **Acceptance Criteria**:
  - [ ] Zod validation failures return (via error handler) HTTP `400` with `details` array
  - [ ] No stack traces or raw zod error JSON leak to client
  - [ ] If `responseSchema` is provided and handler returns wrong data shape, response becomes 500 envelope (generic) and error is logged

  **QA Scenarios**:
  ```
  Scenario: Params validation error yields 400 + details
    Tool: Bun test
    Steps: Run tests added in Task 5 for invalid params
    Expected: status=400; json.success=false; json.details[0].source=="params"
    Evidence: .sisyphus/evidence/task-3-params-validation.txt

  Scenario: Body validation error yields 400 + details
    Tool: Bun test
    Steps: Run tests added in Task 5 for invalid body
    Expected: status=400; json.success=false; json.details includes source "body"
    Evidence: .sisyphus/evidence/task-3-body-validation.txt

  Scenario: Output schema mismatch yields 500 envelope
    Tool: Bun test
    Steps: Run tests added in Task 5 for responseSchema mismatch
    Expected: status=500; json.success=false; json.error is generic
    Evidence: .sisyphus/evidence/task-3-output-schema-mismatch.txt
  ```

  **Commit**: YES | Message: `fix(presentation): map zod validation failures to RequestValidationError` | Files: `src/presentation/adapter/request.adapter.ts`


- [ ] 4. Wire error handler into request flow (no unhandled errors)

  **What to do**:
  - Decide wiring point (fixed decision): **RequestAdapter catches and delegates to presentation error handler**.
  - Update `src/presentation/adapter/request.adapter.ts`:
    - Inject error handler dependency (from Task 2) via constructor.
    - In `catch`, delegate `return this.errorHandler.handle(error, request)` for all errors.
    - Logging decision (fixed): error handler logs errors (warn for expected, error for unexpected); adapter logs only successful parse debug.
  - Update `src/presentation/routes/bun.routes.ts`:
    - Provide error handler when constructing RequestAdapter.
  - Update DI container `src/container/register.ts`:
    - Register error handler singleton.
    - Ensure BunRoutes receives it via constructor injection (add `errorHandler` to BunRoutes deps).

  **Must NOT do**:
  - Do not add new middleware stacks in BunServer.
  - Do not return non-envelope responses.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: touches multiple files + DI wiring
  - Skills: [`clean-architecture`] — keep dependency direction coherent

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 5, 6 | Blocked By: 1, 2, 3

  **References**:
  - Routes create adapter: `src/presentation/routes/bun.routes.ts`
  - Adapter: `src/presentation/adapter/request.adapter.ts`
  - Container registrations: `src/container/register.ts`
  - Server entry: `src/infrastructure/server/bun.server.ts`

  **Acceptance Criteria**:
  - [ ] Calling a handler path that throws `InvoiceNotFoundError` returns 404 envelope (not crash)
  - [ ] Method mismatch returns 405 envelope
  - [ ] Invalid JSON body returns 400 envelope

  **QA Scenarios**:
  ```
  Scenario: Domain error thrown in handler becomes envelope
    Tool: Bun test
    Steps: Run new adapter tests (Task 5)
    Expected: InvoiceNotFoundError -> 404 response with {success:false,error}
    Evidence: .sisyphus/evidence/task-4-domain-error-envelope.txt

  Scenario: Invalid method becomes 405 envelope
    Tool: Bun test
    Steps: Run new adapter tests (Task 5)
    Expected: status=405; {success:false,error}
    Evidence: .sisyphus/evidence/task-4-method-not-allowed.txt
  ```

  **Commit**: YES | Message: `refactor(presentation): route all request errors through error handler` | Files: `src/presentation/adapter/request.adapter.ts`, `src/presentation/routes/bun.routes.ts`, `src/container/register.ts`


- [ ] 5. Add/extend bun:test coverage for response factory + adapter error mapping

  **What to do**:
  - Add unit tests for ResponseFactory: `tests/presentation/factory/response.factory.test.ts` (new folder if needed) covering:
    - `success`, `created`, `badRequest`, `notFound`, `conflict`, `internalError`, `validationError`, `error`.
    - Assert status codes + envelope fields.
  - Add tests for RequestAdapter error handling: `tests/presentation/adapter/request.adapter.test.ts` verifying:
    - Zod invalid params/query/body -> 400 with details
    - Invalid JSON body -> 400
    - Handler throws `InvoiceNotFoundError` -> 404
    - Handler throws generic Error -> 500 (generic message)
    - Invalid method -> 405
    - responseSchema mismatch (handler returns success envelope with wrong `data`) -> 500 (generic)
  - Use existing mocks/fixtures patterns under `tests/mocks/*` and `tests/fixtures/*`.

  **Must NOT do**:
  - Do not write full integration tests spinning real Bun server (out of scope).

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: tests require careful request construction + assertions
  - Skills: []

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 6 | Blocked By: 2, 3, 4

  **References**:
  - Existing handler tests style: `tests/presentation/handler/get-invoice.handler.test.ts`
  - ResponseFactory: `src/presentation/factory/response.factory.ts`
  - RequestAdapter: `src/presentation/adapter/request.adapter.ts`
  - Presentation errors: `src/presentation/error/request-adapter.error.ts`

  **Acceptance Criteria**:
  - [ ] `bun test` includes new tests and they pass locally
  - [ ] New tests assert envelope shape for both success and error

  **QA Scenarios**:
  ```
  Scenario: ResponseFactory contract locked
    Tool: Bash
    Steps: bun test tests/presentation/factory/response.factory.test.ts
    Expected: exits 0
    Evidence: .sisyphus/evidence/task-5-responsefactory-tests.txt

  Scenario: Adapter error mapping locked
    Tool: Bash
    Steps: bun test tests/presentation/adapter/request.adapter.test.ts
    Expected: exits 0
    Evidence: .sisyphus/evidence/task-5-adapter-tests.txt
  ```

  **Commit**: YES | Message: `test(presentation): lock response envelope and error mapping` | Files: new tests under `tests/presentation/*`


- [ ] 6. Repo-wide verification + cleanup

  **What to do**:
  - Run full verification commands:
    - `bun test`
    - `bun run typecheck`
    - `bun run lint`
  - Ensure infra middleware folder no longer referenced:
    - Remove `src/infrastructure/middleware/index.ts` export if file removed.
  - Grep for forbidden coupling:
    - Domain should not import from `src/presentation/*` or contain HTTP handler contracts.
  - Ensure all changed paths are consistent with barrel exports.

  **Must NOT do**:
  - Do not change response envelope.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` — Reason: broad verification + small fixes
  - Skills: []

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: none | Blocked By: 1, 2, 3, 4, 5

  **References**:
  - Scripts: `package.json`

  **Acceptance Criteria**:
  - [ ] `bun test` passes
  - [ ] `bun run typecheck` passes
  - [ ] `bun run lint` passes
  - [ ] No `Response` types in `src/domain/` exported APIs

  **QA Scenarios**:
  ```
  Scenario: Full verification
    Tool: Bash
    Steps: bun test && bun run typecheck && bun run lint
    Expected: exits 0
    Evidence: .sisyphus/evidence/task-6-verify.txt

  Scenario: Domain coupling audit
    Tool: Bash
    Steps: grep -R "presentation/" src/domain || true
    Expected: no matches
    Evidence: .sisyphus/evidence/task-6-domain-coupling-grep.txt
  ```

  **Commit**: YES | Message: `chore: verify response architecture refactor` | Files: any small cleanup adjustments


## Final Verification Wave (4 parallel agents, ALL must APPROVE)
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- Prefer 3-5 atomic commits matching tasks 1-6 messages.
- Do not squash unless requested.

## Success Criteria
- API clients still receive the same envelope shape for success and errors.
- No unhandled exceptions escape request processing (errors always mapped).
- Clean Architecture boundary improved: domain no longer defines HTTP handler types.
