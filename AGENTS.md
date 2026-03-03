# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-03
**Commit:** effa4dd
**Branch:** main

## OVERVIEW

QR Payment backend service. Clean Architecture + DDD. Bun runtime, TypeScript, Kysely ORM, PostgreSQL. AWILIX DI container. Task runner for CI/CD.

## STRUCTURE

```
qr-payment/
├── src/
│   ├── domain/          # Core business logic (entities, interfaces, types, schemas, errors, enums)
│   ├── application/     # Use cases orchestrate business rules
│   ├── infrastructure/  # External concerns (DB, server, config, logger, services)
│   ├── presentation/    # HTTP layer (handlers, adapters, routes, render)
│   └── container/       # DI container registration
├── tests/               # Test suites (mirrors src structure)
├── biome.json           # Linting + formatting (Biome)
├── tsconfig.json        # TypeScript strict mode, bundler resolution
├── Taskfile.yml         # Task runner (build, test, lint commands)
└── package.json         # Dependencies
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add business entity | `src/domain/entity/` | Extend Entity pattern, getters throw `*FieldNotFoundError` |
| Add repository interface | `src/domain/interface/` | Define contract, impl in `infrastructure/repositories/` |
| Add use case | `src/application/use-case/` | Orchestrate domain objects |
| Add HTTP endpoint | `src/presentation/handler/` + `src/presentation/routes/` | Handler declares pathname/method, routes wires them |
| Change DB query | `src/infrastructure/repositories/` | Kysely implementation |
| Add config | `src/domain/schema/env.schema.ts` + `src/infrastructure/config/` | Zod env schema + AppConfig |
| Register new dependency | `src/container/register.ts` | Use `asClass()` or `asFunction()` |
| Add tests | `tests/` | Mirror src structure, use mocks/fixtures |
| Add mock | `tests/mocks/` | Create mock implementing domain interface |
| Add fixture | `tests/fixtures/` | Test data builders |

## CONVENTIONS

### File Naming
- `*.interface.ts` - Domain interfaces (e.g., `logger.interface.ts`)
- `*.type.ts` - Type aliases and DTOs (e.g., `invoice.type.ts`)
- `*.schema.ts` - Zod schemas (e.g., `invoice.schema.ts`)
- `*.entity.ts` - Domain entities (e.g., `invoice.entity.ts`)
- `*.handler.ts` - Request handlers (e.g., `create-invoice.handler.ts`)
- `*.adapter.ts` - Request adapters (e.g., `request.adapter.ts`)
- `*.render.ts` - Response renderers (e.g., `json.render.ts`)
- `*.use-case.ts` - Application use cases
- `*.repository.ts` - Repository implementations
- File names: kebab-case | Classes: PascalCase | Properties: camelCase

### Dependency Injection Pattern
```typescript
// Constructor receives _deps object, private getters expose dependencies
constructor(private _deps: { logger: Logger; repo: Repository }) {}
private get logger() { return this._deps.logger; }
```

### Entity Pattern
```typescript
// Entities accept partial DTOs, getters enforce required fields
export class Invoice {
  constructor(private _data: InvoiceSelectDto) {} // No validate() call
  
  get invoiceId(): number {
    if (!this._data.invoiceId) throw new InvoiceFieldNotFoundError("invoiceId");
    return this._data.invoiceId;
  }
}
```

### TypeScript Config
- `module: Preserve`, `moduleResolution: bundler` - Bundler-optimized
- `verbatimModuleSyntax: true` - Preserve import syntax
- `noEmit: true` - Type-check only
- `strict: true` + `noUncheckedIndexedAccess: true`
- `noUnusedLocals: false` / `noUnusedParameters: false` - Intentionally relaxed

### Formatting (Biome)
- Indent: tabs
- Quotes: double
- Organize imports: auto

## ANTI-PATTERNS (THIS PROJECT)

| Pattern | Reason |
|---------|--------|
| `as any` / `@ts-ignore` | Never suppress types |
| Express/Fastify | Use `Bun.serve()` only |
| `dotenv` package | Bun auto-loads `.env` |
| `node:*` imports | Use Bun APIs (`bun:sqlite`, `Bun.file`, `Bun.$`) |
| `ioredis` | Use `Bun.redis` |
| `pg` client directly | Use Kysely abstraction |

## COMMANDS

```bash
# Development
bun ./src/index.ts              # Run server
bun --hot ./src/index.ts        # Run with HMR

# Testing
bun test                        # Run all tests
bun test <file>                 # Run specific test

# Build
bun build ./src/index.ts        # Production build

# Code quality
bunx biome check .              # Lint
bunx biome format . --write     # Format

# Task runner (alternative)
task dev                        # Dev server with HMR
task test                       # Run tests
task build                      # Production build
task ci                         # Run all CI tasks

# Install
bun install                     # Install deps (auto-loads .env)
```

## NOTES

- **Entry point**: `src/index.ts` bootstraps container, starts server, handles graceful shutdown (SIGINT/SIGTERM)
- **CI/CD**: GitHub Actions workflow with lint → typecheck → test → build pipeline
- **Task runner**: Taskfile.yml for build/test/lint automation
- **Inngest dependency**: Present but no worker/processor files yet
- **Known gap**: `JsonRender.error()` in `src/presentation/render/json.render.ts` throws "Method not implemented"
