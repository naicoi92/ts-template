# 🚀 Bun Clean Architecture Starter

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Runtime-Bun-black?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Biome](https://img.shields.io/badge/Linter-Biome-60a5fa?logo=biome)](https://biomejs.dev/)

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
- **🎨 Biome** - Fast linter and formatter (no ESLint/Prettier needed)

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
src/
├── domain/              # Core business logic (framework-agnostic)
│   ├── entity/          # Domain entities with validation
│   ├── interface/       # Repository contracts, interfaces
│   ├── type/            # DTOs, type aliases
│   ├── schema/          # Zod validation schemas
│   ├── error/           # Domain-specific errors
│   └── enum/            # Domain enums
│
├── application/         # Use cases orchestrate business rules
│   └── use-case/        # Application-specific business rules
│
├── infrastructure/      # External concerns (DB, server, config)
│   ├── config/          # Configuration loaders
│   ├── database/        # Kysely setup, migrations
│   ├── logger/          # Logging implementations
│   ├── middleware/      # HTTP middleware
│   ├── repositories/    # Repository implementations
│   ├── server/          # Bun server setup
│   └── service/         # Infrastructure services
│
├── presentation/        # HTTP layer
│   ├── adapter/         # Request/response adapters
│   ├── factory/         # Response factories
│   ├── handler/         # HTTP handlers
│   └── routes/          # Route definitions
│
└── container/           # DI container registration
    └── register.ts      # Awilix container setup
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server with hot reload |
| `bun run start` | Start production server |
| `bun run build` | Build for production |
| `bun run lint` | Run Biome linter |
| `bun run lint:fix` | Fix linting issues |
| `bun run format` | Format code with Biome |
| `bun run typecheck` | Run TypeScript type checking |
| `bun run test` | Run tests |
| `bun run test:watch` | Run tests in watch mode |
| `bun run clean` | Clean build artifacts |

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
  
  get id() { return this._data.id; }
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

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📋 What's Included

- ✅ Clean Architecture folder structure
- ✅ TypeScript strict mode configuration
- ✅ Biome for linting and formatting
- ✅ Zod for environment and input validation
- ✅ Kysely ORM with PostgreSQL
- ✅ Awilix dependency injection
- ✅ Structured logging with Pino
- ✅ Graceful shutdown handling
- ✅ Example domain entities and use cases
- ✅ GitHub Actions CI workflow
- ✅ Issue and PR templates

## 🔮 Roadmap

- [ ] Add database migration setup
- [ ] Add authentication middleware example
- [ ] Add rate limiting
- [ ] Add OpenAPI documentation
- [ ] Add Docker configuration
- [ ] Add more test examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/33/the-clean-architecture.html) by Robert C. Martin
- [Bun](https://bun.sh/) - Fast JavaScript runtime
- [Kysely](https://kysely.dev/) - Type-safe SQL query builder
- [Awilix](https://github.com/jeffijoe/awilix) - Dependency injection container
