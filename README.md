# 🚀 Bun Clean Architecture Starter

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Runtime-Bun-black?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Oxlint](https://img.shields.io/badge/Linter-Oxlint-60a5fa?logo=oxc)](https://oxc.rs/)

A production-ready TypeScript starter template featuring Clean Architecture, Domain-Driven Design principles, Bun runtime, Kysely ORM, and PostgreSQL.

## 🌟 Introduction

This template provides a solid foundation for building scalable, maintainable backend services with TypeScript. It follows Clean Architecture principles with clear separation of concerns across domain, application, infrastructure, and presentation layers.

## 💡 Why This Template

- **⚡ Bun Runtime** - Fast JavaScript runtime with native TypeScript support
- **🏗️ Clean Architecture** - Domain-centric design with dependency inversion
- **📦 DDD Patterns** - Rich domain entities, repository interfaces, use cases
- **🔧 Kysely ORM** - Type-safe SQL query builder for PostgreSQL
- **💉 Awilix DI** - Powerful dependency injection container
- **📝 Zod Validation** - Runtime type validation with TypeScript inference
- **📊 Structured Logging** - LogLayer with Pino transport for production-ready logging
- **🎨 Oxlint/Oxfmt** - Fast linter and formatter from Ox toolchain

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [PostgreSQL](https://www.postgresql.org/) >= 14
- Node.js >= 18 (optional, for some tooling)

### Installation

1. **Use this template**

    Click the "Use this template" button on GitHub or:

    ```bash
    # Using degit (recommended)
    npx degit yourusername/bun-clean-architecture-starter my-project

    # Or clone directly
    git clone https://github.com/yourusername/bun-clean-architecture-starter.git my-project
    cd my-project
    ```

2. **Install dependencies**

    ```bash
    bun install
    ```

3. **Configure environment**

    ```bash
    cp .env.example .env
    # Edit .env with your database credentials
    ```

4. **Run development server**

    ```bash
    bun run dev
    ```

## 📁 Project Structure

```
qr-payment/
├── src/
│   ├── domain/              # Core business logic (framework-agnostic)
│   │   ├── entity/          # Domain entities with validation
│   │   ├── interface/       # Repository contracts, interfaces
│   │   ├── type/            # DTOs, type aliases
│   │   ├── schema/          # Zod validation schemas
│   │   ├── error/           # Domain-specific errors
│   │   └── enum/            # Domain enums
│   │
│   ├── application/         # Use cases orchestrate business rules
│   │   └── use-case/        # Application-specific business rules
│   │
│   ├── infrastructure/      # External concerns (DB, server, config)
│   │   ├── config/          # Configuration loaders
│   │   ├── database/        # Kysely setup, migrations
│   │   ├── logger/          # Logging implementations
│   │   ├── middleware/      # HTTP middleware
│   │   ├── repositories/    # Repository implementations
│   │   ├── server/          # Bun server setup
│   │   └── service/         # Infrastructure services
│   │
│   ├── presentation/        # HTTP layer
│   │   ├── adapter/         # Request/response adapters
│   │   ├── factory/         # Response factories
│   │   ├── handler/         # HTTP handlers
│   │   └── routes/          # Route definitions
│   │
│   └── container/           # DI container registration
│       └── register.ts      # Awilix container setup
│
├── tests/                   # Test suites (mirrors src structure)
│   ├── mocks/               # Mock implementations
│   ├── fixtures/            # Test data builders
│   ├── domain/              # Domain entity tests
│   ├── application/         # Use case tests
│   ├── infrastructure/      # Repository & service tests
│   └── presentation/        # Handler & adapter tests
│
├── oxlint.json              # Linting config (Oxlint)
├── tsconfig.json            # TypeScript strict mode, bundler resolution
├── Taskfile.yml             # Task runner (build, test, lint commands)
└── package.json             # Dependencies
```

## 🛠️ Available Scripts

### NPM Scripts

| Script               | Description                              |
| -------------------- | ---------------------------------------- |
| `bun run dev`        | Start development server with hot reload |
| `bun run start`      | Start production server                  |
| `bun run build`      | Build for production                     |
| `bun run lint`       | Run oxlint linter                        |
| `bun run lint:fix`   | Fix linting issues                       |
| `bun run format`     | Format code with oxfmt                   |
| `bun run typecheck`  | Run TypeScript type checking             |
| `bun run test`       | Run tests                                |
| `bun run test:watch` | Run tests in watch mode                  |
| `bun run clean`      | Clean build artifacts                    |

### Task Runner (Recommended for CI)

| Command       | Description                                           |
| ------------- | ----------------------------------------------------- |
| `task dev`    | Dev server with HMR                                   |
| `task build`  | Production build with minify + sourcemap              |
| `task test`   | Run tests                                             |
| `task lint`   | Run oxlint + oxfmt check                              |
| `task ci`     | Run all CI tasks (lint → typecheck → test → build)    |
| `task clean`  | Clean build artifacts                                 |

> **Note**: Taskfile is the canonical task runner. CI uses package.json scripts with slight differences (Taskfile adds `--minify --sourcemap` to build).

## 📝 Key Patterns

### Entity Pattern

Entities are rich domain objects with validation:

```typescript
// src/domain/entity/invoice.entity.ts
export class Invoice {
	constructor(private _data: InvoiceDto) {
		this.validate();
	}

	private validate() {
		if (!this._data.orderId) throw new Error("orderId required");
	}

	get id() {
		return this._data.id;
	}
}
```

### Repository Interface

Define contracts in domain layer, implement in infrastructure:

```typescript
// src/domain/interface/invoice-repository.interface.ts
export interface InvoiceRepository {
	findByOrderId(orderId: string): Promise<Invoice | null>;
	create(data: InvoiceCreateDto): Promise<Invoice>;
}
```

### Dependency Injection

Constructor injection with Awilix:

```typescript
constructor(private _deps: {
  logger: Logger;
  repo: Repository
}) {}

private get logger() { return this._deps.logger; }
```

## 🔧 Configuration

### Environment Variables

Environment variables are validated with Zod:

```typescript
// src/domain/schema/env.schema.ts
export const EnvSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	PORT: z.string().transform(Number).default(4001),
	DATABASE_URL: z.string(),
	LOG_LEVEL: z.enum(LogLevel).default(LogLevel.INFO),
});
```

### TypeScript

- `strict: true` + `noUncheckedIndexedAccess: true` | `noEmit: true`
- `module: Preserve` | `moduleResolution: bundler` | `verbatimModuleSyntax: true`
- `jsx: react-jsx` | `allowJs: true`

### Code Style

- **Linter**: Oxlint (no config file - uses defaults)
- **Formatter**: Oxfmt (tabs indent, double quotes)
- **Editor**: See `.editorconfig` for IDE settings

## 🧪 Testing

Tests use Bun test runner with class-based mocks and fixture patterns:

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/domain/entity/invoice.entity.test.ts

# Run tests in watch mode
bun test --watch

# Run with CI timeout
bun test --timeout=10000
```

### Test Conventions

- **Location**: `tests/` mirrors `src/` structure
- **Naming**: `<source-file>.test.ts`
- **Fixtures**: Use `tests/fixtures/` for test data
- **Mocks**: Class-based mocks in `tests/mocks/` with `reset()` and `seed*()` helpers

## 🚀 CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

1. **Lint** - oxlint + oxfmt check
2. **Typecheck** - bunx tsc --noEmit
3. **Test** - bun test --timeout=10000
4. **Build** - bun build + upload dist/ artifact (7-day retention)

- Bun version pinned: 1.3.11
- Cache: ~/.bun/install/cache + node_modules
- No Docker - artifact-based deployment

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📋 What's Included

- ✅ Clean Architecture folder structure (domain/application/infrastructure/presentation)
- ✅ TypeScript strict mode configuration (~6,200 lines)
- ✅ Oxlint/Oxfmt for linting and formatting (Ox toolchain)
- ✅ Zod for environment and input validation
- ✅ Kysely ORM with PostgreSQL
- ✅ Awilix dependency injection with container registration
- ✅ Structured logging with LogLayer + Pino
- ✅ Bun native server with graceful shutdown
- ✅ Request/Response adapters with body parsing
- ✅ Example domain entities (Invoice, Customer, Partner)
- ✅ Complete use cases with proxy patterns
- ✅ Comprehensive test suite with mocks & fixtures
- ✅ GitHub Actions CI workflow (lint → typecheck → test → build)
- ✅ Task runner (Taskfile.yml) for local development
- ✅ Issue and PR templates

## 📚 Documentation

Detailed documentation for each layer is available in `AGENTS.md` files throughout the project:

| Document | Description |
|----------|-------------|
| [`AGENTS.md`](./AGENTS.md) | Project overview, commands, configuration |
| [`src/domain/AGENTS.md`](./src/domain/AGENTS.md) | Domain layer patterns (Entity, Repository) |
| [`src/application/AGENTS.md`](./src/application/AGENTS.md) | Use case patterns, Proxy, Builder |
| [`src/infrastructure/AGENTS.md`](./src/infrastructure/AGENTS.md) | Infrastructure patterns (Kysely, Config) |
| [`src/presentation/AGENTS.md`](./src/presentation/AGENTS.md) | Handler, Adapter, Render patterns |
| [`tests/AGENTS.md`](./tests/AGENTS.md) | Testing conventions and patterns |

## 🔮 Roadmap

- [x] Clean Architecture structure
- [x] Domain entities with validation
- [x] Use cases with proxy patterns
- [x] Authentication middleware
- [x] Comprehensive test suite
- [ ] Add database migration setup
- [ ] Add rate limiting
- [ ] Add OpenAPI documentation
- [ ] Add Docker configuration
- [ ] Add performance benchmarks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/33/the-clean-architecture.html) by Robert C. Martin
- [Bun](https://bun.sh/) - Fast JavaScript runtime
- [Kysely](https://kysely.dev/) - Type-safe SQL query builder
- [Awilix](https://github.com/jeffijoe/awilix) - Dependency injection container
