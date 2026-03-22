# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-20
**Commit:** 8fc32a6
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
├── oxlint.json          # Linting config (Oxlint)
├── tsconfig.json        # TypeScript strict mode, bundler resolution
├── Taskfile.yml         # Task runner (build, test, lint commands)
└── package.json         # Dependencies
```

## WHERE TO LOOK

| Task                     | Location                                                         | Notes                                                      |
| ------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Add business entity      | `src/domain/entity/`                                             | Extend Entity pattern, getters throw `*FieldNotFoundError` |
| Add repository interface | `src/domain/interface/`                                          | Define contract, impl in `infrastructure/repositories/`    |
| Add use case             | `src/application/use-case/`                                      | Orchestrate domain objects                                 |
| Add HTTP endpoint        | `src/presentation/handler/` + `src/presentation/routes/`         | Handler declares pathname/method, routes wires them        |
| Change DB query          | `src/infrastructure/repositories/`                               | Kysely implementation                                      |
| Add config               | `src/domain/schema/env.schema.ts` + `src/infrastructure/config/` | Zod env schema + AppConfig                                 |
| Register new dependency  | `src/container/register.ts`                                      | Use `asClass()` or `asFunction()`                          |
| Add tests                | `tests/`                                                         | Mirror src structure, use mocks/fixtures                   |
| Add mock                 | `tests/mocks/`                                                   | Create mock implementing domain interface                  |
| Add fixture              | `tests/fixtures/`                                                | Test data builders                                         |

## CONVENTIONS

### File Naming

- `*.interface.ts` - Domain interfaces | `*.type.ts` - DTOs | `*.schema.ts` - Zod schemas
- `*.entity.ts` - Domain entities | `*.handler.ts` - HTTP handlers | `*.use-case.ts` - Use cases
- `*.repository.ts` - Repository impls | `*.adapter.ts` - Request adapters | `*.render.ts` - Response renderers
- kebab-case files | PascalCase classes | camelCase properties

### Core Patterns (see child AGENTS.md for details)

| Pattern    | Location                     | Key Points                                               |
| ---------- | ---------------------------- | -------------------------------------------------------- |
| Entity     | `src/domain/AGENTS.md`       | Partial DTOs, getters throw `*FieldNotFoundError`        |
| Repository | `src/domain/AGENTS.md`       | Interface in domain, impl in infrastructure              |
| Use Case   | `src/application/AGENTS.md`  | Implements `UseCase<I, O>`, orchestrates domain          |
| Handler    | `src/presentation/AGENTS.md` | Returns typed data, NOT Response object                  |
| DI         | All layers                   | `constructor(private _deps: {...}) {}` + private getters |

### TypeScript & Formatting

- `strict: true` + `noUncheckedIndexedAccess: true` | `noEmit: true`
- `module: Preserve` | `moduleResolution: bundler` | `verbatimModuleSyntax: true`
- Oxlint/oxfmt: tabs indent, double quotes

## ANTI-PATTERNS (THIS PROJECT)

| Pattern                 | Reason                                           |
| ----------------------- | ------------------------------------------------ |
| `as any` / `@ts-ignore` | Never suppress types                             |
| Express/Fastify         | Use `Bun.serve()` only                           |
| `dotenv` package        | Bun auto-loads `.env`                            |
| `node:*` imports        | Use Bun APIs (`bun:sqlite`, `Bun.file`, `Bun.$`) |
| `ioredis`               | Use `Bun.redis`                                  |
| `pg` client directly    | Use Kysely abstraction                           |

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
oxlint .                        # Lint
oxfmt . --write                 # Format

# Task runner (alternative)
task dev                        # Dev server with HMR
task test                       # Run tests
task build                      # Production build
task ci                         # Run all CI tasks

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
- **Ox toolchain**: Uses oxlint/oxfmt (Ox toolchain) for linting and formatting
