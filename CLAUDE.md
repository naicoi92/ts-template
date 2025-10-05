# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
```bash
bun run dev          # Run with watch mode (tsx watch)
bun run build        # Compile TypeScript
bun run start        # Run compiled code
```

**Code Quality:**
```bash
bun run lint         # Check code with Biome
bun run lint:fix     # Auto-fix linting issues
bun run format       # Format code with Biome
bun run type-check   # TypeScript type checking
bun run check        # Run lint + type-check
```

**Git Hooks:**
- Pre-commit: Auto-format staged files
- Pre-push: Lint + type-check

Install hooks: `bunx lefthook install`

## Architecture

This codebase follows **Clean Architecture** with strict layer separation:

```
src/
├── domain/           # Core business logic (innermost layer)
│   ├── entities/     # Business objects
│   ├── interfaces/   # Contracts (repositories, services)
│   └── errors/       # Domain-specific errors
├── application/      # Use cases & business rules
│   ├── use-cases/    # Business workflows
│   └── dto/          # Data transfer objects
├── infrastructure/   # External concerns (outermost layer)
│   ├── repositories/ # Data persistence implementations
│   └── config/       # Environment & configuration
├── presentation/     # Entry points (API/Controllers)
│   └── controllers/  # Request handlers
└── shared/           # Cross-cutting concerns (logger, utils)
```

**Key Principles:**
1. **Dependency Rule**: Dependencies point inward. Domain has ZERO external dependencies.
2. **Dependency Injection**: All dependencies wired via TSyringe container in `src/container.ts`
3. **Token System**: DI tokens defined in `src/tokens.ts` using Symbol.for() for type-safety

**Adding New Features:**
1. Define entity/interface in `domain/`
2. Create use case in `application/use-cases/`
3. Implement repository in `infrastructure/repositories/`
4. Create controller in `presentation/controllers/`
5. Register all in `src/container.ts` + add tokens to `src/tokens.ts`

## Configuration

Environment variables validated with Zod schema in `src/infrastructure/config/app.config.ts`:
- Required: `NODE_ENV`, `PORT`, `APP_NAME`, `APP_BASE_URL`, `LOG_LEVEL`
- See `.env.example` for reference
- Bun auto-loads `.env` files

## Code Style

- **Formatter**: Biome with tabs (configured in `biome.json`)
- **Linter**: Biome recommended rules
- **TypeScript**: Strict mode + decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
- **Path Alias**: `@/*` maps to `src/*`

## Dependency Injection

Must import `reflect-metadata` at entry point before any decorators:
```typescript
import "reflect-metadata";
import { container } from "@/container";
```

Use `@injectable()` decorator on all classes that need DI. Resolve via tokens:
```typescript
const service = container.resolve<IService>(TOKENS.MY_SERVICE);
```
