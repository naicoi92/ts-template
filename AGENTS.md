# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-25
**Commit:** 8fc32a6
**Branch:** main
**Lines of Code:** ~6,200 TypeScript

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

### Global

| Pattern                 | Reason                                           |
| ----------------------- | ------------------------------------------------ |
| `as any` / `@ts-ignore` | Never suppress types                             |
| Express/Fastify         | Use `Bun.serve()` only                           |
| `dotenv` package        | Bun auto-loads `.env`                            |
| `node:*` imports        | Use Bun APIs (`bun:sqlite`, `Bun.file`, `Bun.$`) |
| `ioredis`               | Use `Bun.redis`                                  |
| `pg` client directly    | Use Kysely abstraction                           |

### Layer-Specific

| Layer          | Anti-Pattern                          | Rule                                       |
| -------------- | ------------------------------------- | ------------------------------------------ |
| Domain         | Infrastructure imports                | Domain never imports from other layers     |
| Domain         | Return null from repositories         | Throw `*NotFoundError` instead             |
| Application    | Import infrastructure implementations | Inject domain interfaces only              |
| Infrastructure | Import other infrastructure classes   | Use constructor injection                  |
| Presentation   | Return Response from handlers         | Return typed data, render handles Response |
| Presentation   | Handler depends on infrastructure     | Handlers depend on application layer only  |
| Tests          | Inline test data                      | Use fixtures from `tests/fixtures/`        |

## COMMANDS

### Development

```bash
bun ./src/index.ts              # Run server
bun --hot ./src/index.ts        # Run with HMR
```

### Testing

```bash
bun test                        # Run all tests
bun test tests/domain           # Run domain tests only
bun test --watch                # Watch mode
bun test --timeout=10000        # CI timeout
```

### Build

```bash
# Production build (package.json - basic)
bun run build

# Production build (Taskfile - with minify + sourcemap)
task build
# Equivalent: bun build ./src/index.ts --outdir ./dist --target bun --minify --sourcemap
```

### Code Quality

```bash
oxlint .                        # Lint
oxlint --fix                    # Fix linting issues
oxfmt . --write                 # Format
oxfmt --check                   # Check formatting (CI)
```

### Type Checking

```bash
# Taskfile (recommended - uses bunx)
task typecheck

# package.json (uses installed tsc)
bun run typecheck
```

### Task Runner (Alternative)

```bash
task dev                        # Dev server with HMR
task test                       # Run tests
task build                      # Production build with minify
task ci                         # Run all CI tasks (lint → typecheck → test → build)
task clean                      # Clean build artifacts
```

### Install

```bash
bun install                     # Install deps (auto-loads .env)
bun install --frozen-lockfile   # CI install
```

## CONFIGURATION

### TypeScript

- `strict: true` + `noUncheckedIndexedAccess: true` | `noEmit: true`
- `module: Preserve` | `moduleResolution: bundler` | `verbatimModuleSyntax: true`
- `jsx: react-jsx` | `allowJs: true` (non-standard for backend)

### EditorConfig

- `indent_style = tab` (global default)
- `indent_size = 4` | `charset = utf-8` | `end_of_line = lf`
- YAML files: spaces (indent_size = 2)
- JSON files: tabs explicitly

### Tooling

- **Linter**: Oxlint (no oxlint.json config file - uses defaults)
- **Formatter**: Oxfmt (tabs, double quotes)
- **No ESLint**: Project uses Ox toolchain exclusively

## ENTRY POINT FLOW

```
src/index.ts
    ↓ resolves "server" from DI container
src/container/register.ts
    ↓ registers Config, Logger, DB, Repositories, Services, Handlers, Routes, Server
src/infrastructure/server/bun.server.ts
    ↓ Bun.serve() with routes from BunRoutes
src/presentation/routes/bun.routes.ts
    ↓ maps handler.pathname → RequestAdapter
src/presentation/adapter/request.adapter.ts
    ↓ validates method, parses params/query/body, calls handler
src/presentation/render/json.render.ts
    ↓ returns Response.json()
```

## NON-STANDARD PATTERNS

| Pattern               | Note                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Route mapping         | By pathname only (method check in RequestAdapter). Same path different methods not supported. |
| Container.build       | Used inside asFunction registrations - potential ordering issues                              |
| headerProviderFactory | Function in container (not class) - per-request factory                                       |
| Config parsing        | Immediate Zod parsing in constructor - env must be set before container creation              |

## CI/CD PIPELINE

GitHub Actions (`.github/workflows/ci.yml`):

1. **lint**: oxlint + oxfmt check
2. **typecheck**: bunx tsc --noEmit
3. **test**: bun test --timeout=10000 (needs lint + typecheck)
4. **build**: bun build + upload dist/ artifact (retention: 7 days)

- Bun version pinned: 1.3.11
- Cache: ~/.bun/install/cache + node_modules
- **No Docker**: Artifact-based deployment only
- **No CD**: Build artifact uploaded but no deploy step

## NOTES

- **Entry point**: `src/index.ts` bootstraps container, starts server, handles graceful shutdown (SIGINT/SIGTERM)
- **Task runner**: Taskfile.yml is canonical (CI uses package.json scripts - slight discrepancies)
- **Build differences**: Taskfile adds --minify --sourcemap; package.json build omits them
- **Inngest dependency**: Present but no worker/processor files yet
- **Known gap**: `JsonRender.error()` implemented but may need refinement
- **Unused deps**: @trpc/server declared but not used in src/
- **Doc mismatch**: Some AGENTS.md notes about unimplemented features may be stale
