# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-26
**Commit:** 738aef3
**Branch:** main

## OVERVIEW

QR Payment backend service. Clean Architecture + DDD. Bun runtime, TypeScript, Kysely ORM, PostgreSQL. AWILIX DI container.

## STRUCTURE

```
qr-payment/
├── src/
│   ├── domain/          # Core business logic (entities, interfaces, types, schemas, errors, enums)
│   ├── application/     # Use cases orchestrate business rules
│   ├── infrastructure/  # External concerns (DB, server, config, logger, routers)
│   ├── presentation/    # HTTP handlers, adapters, routes
│   └── container/       # DI container registration
├── biome.json           # Linting + formatting (Biome, not ESLint/Prettier)
├── tsconfig.json        # TypeScript strict mode, bundler resolution
└── package.json         # No scripts - use `bun` directly
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add business entity | `src/domain/entity/` | Extend Entity pattern, validate in constructor |
| Add repository interface | `src/domain/interface/` | Define contract, impl in `infrastructure/repositories/` |
| Add use case | `src/application/use-case/` | Orchestrate domain objects |
| Add HTTP endpoint | `src/infrastructure/router/` + `src/presentation/handler/` | Router defines routes, Handler processes requests |
| Change DB query | `src/infrastructure/repositories/` | Kysely implementation |
| Add config | `src/domain/type/config.type.ts` + `src/infrastructure/config/` | Type + loader pattern |
| Register new dependency | `src/container/register.ts` | Use `asClass()` or `asValue()` |

## CONVENTIONS

### File Naming
- `*.interface.ts` - Domain interfaces (e.g., `logger.interface.ts`)
- `*.type.ts` - Type aliases and DTOs (e.g., `invoice.type.ts`)
- `*.schema.ts` - Zod schemas (e.g., `invoice.schema.ts`)
- `*.entity.ts` - Domain entities (e.g., `invoice.entity.ts`)
- `*.handler.ts` - Request handlers (e.g., `create-invoice.handler.ts`)
- `*.adapter.ts` - Adapters (e.g., `fetch.adapter.ts`)
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
export class Entity {
  constructor(private _data: Dto) { this.validate(); }
  private validate() { /* throw if invalid */ }
  get property() { return this._data.property; }
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
bun ./src/index.ts              # Run server (needs implementation)
bun --hot ./src/index.ts        # Run with HMR

# Testing
bun test                        # Run all tests
bun test <file>                 # Run specific test

# Build
bun build ./src/index.ts        # Production build

# Code quality
bunx biome check .              # Lint
bunx biome format . --write     # Format

# Install
bun install                     # Install deps (auto-loads .env)
```

## NOTES

- **Entry point missing**: `src/index.ts` is empty - needs bootstrap implementation
- **Handler incomplete**: `CreateInvoiceHandler.handle()` throws "not implemented"
- **Config loader**: `EnvConfigLoader.load()` not implemented
- **No CI/CD**: No GitHub Actions, Makefile, or Docker setup
- **No tests yet**: Project structure ready but test files not created
- **Inngest dependency**: Present but no worker/processor files yet
