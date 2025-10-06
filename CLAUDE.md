# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
```bash
bun run dev          # Dev mode with hot reload (Bun native watch)
bun run build        # Build with Bun bundler (fast, single-file output)
bun run build:types  # Generate TypeScript declaration files (optional)
bun run start        # Run production build
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

## Core Development Principles

### **KISS (Keep It Simple, Stupid)**
- Làm ĐÚNG và ĐỦ yêu cầu, không thêm thắt
- Ưu tiên code đơn giản, dễ hiểu
- Tránh over-engineering và abstraction không cần thiết

### **YAGNI (You Aren't Gonna Need It)**
- KHÔNG thêm tính năng không được yêu cầu
- KHÔNG tạo abstraction không cần thiết
- KHÔNG setup phức tạp khi không cần

### **Early Return Pattern**
- Ưu tiên early return thay vì nested if-else
- Giảm code complexity và improve readability
- Xử lý error cases ngay lập tức

### **Single Responsibility Principle**
- Mỗi class/function chỉ có một trách nhiệm
- Handlers chỉ handle business logic, không handle errors
- Error handling centralized trong HttpRouter

## Architecture

This codebase follows **Clean Architecture** with strict adherence to separation of concerns:

### **Layer Structure**
```
src/
├── domain/           # Core business logic (innermost layer)
│   ├── entities/     # Business objects
│   ├── interfaces/   # Contracts (repositories, services)
│   ├── errors/       # Domain-specific errors
│   └── services/     # Domain services
├── application/      # Use cases & business rules
│   ├── use-cases/    # Business workflows
│   ├── services/     # Application services (error handler, router)
│   └── dto/          # Data transfer objects
├── infrastructure/   # External concerns (outermost layer)
│   ├── repositories/ # Data persistence implementations
│   ├── config/       # Environment & configuration
│   ├── parsing/      # Request body parsing
│   └── server/       # Server implementation
├── presentation/     # Entry points (API/Controllers)
│   └── handlers/     # Request handlers
└── shared/           # Cross-cutting concerns (logger, utils)
```

### **Layer Dependency Rule**
```
┌─────────────────────────────────────────────────────────────┐
│                Presentation Layer (Outermost)                │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 HTTP Router & Handlers                   │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │              Application Layer                     │ │ │
│  │  │  ┌─────────────────────────────────────────────────┐ │ │ │
│  │  │  │              Domain Layer (Core Business)           │ │ │ │
│  │  │  │  ┌─────────────────────────────────────────────┐ │ │ │ │
│  │  │  │  │              Entities & Business Rules       │ │ │ │ │
│  │  │  │  └─────────────────────────────────────────────┘ │ │ │ │
│  │  │  └─────────────────────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **Critical Architecture Rules**

1. **Dependency Direction**: ALL dependencies point INWARD toward the domain
   - Presentation → Application → Domain → ✓ (no dependencies)
   - Domain layer has ZERO external dependencies (no imports from external packages)

2. **Single Responsibility Each Layer**:
   - **Domain**: Business rules, entities, interfaces only
   - **Application**: Use cases, orchestration, application services
   - **Infrastructure**: External concerns (DB, HTTP, config, parsing)
   - **Presentation**: HTTP handling, request/response formatting

3. **Dependency Injection**:
   - TSyringe container in `src/container.ts` handles all wiring
   - Tokens defined in `src/tokens.ts` using `Symbol.for()` for type-safety
   - All classes use `@injectable()` decorator

4. **Error Flow Direction**: Errors bubble OUTWARD to centralized handler
   - Domain → Application → Presentation → HttpRouter → HttpErrorHandler → Client
   - **CRITICAL**: NEVER handle errors in business logic layers, only in HttpRouter

### **Forbidden Dependencies**
❌ **Domain Layer CANNOT import**:
- HTTP libraries (express, fastify, etc.)
- Database drivers (prisma, drizzle, etc.)
- External services or APIs
- Infrastructure concerns

✅ **Domain Layer CAN ONLY import**:
- TypeScript native types
- Built-in Node.js modules (path, crypto, etc.)
- Other domain modules (entities, interfaces, errors)

## Error Handling Architecture

### **Universal Error Principles**
🔴 **CRITICAL**: "handle error cần được thực hiện đúng nơi, đúng chỗ" - Error handling must be in the right place (centralized in HTTP router)

### **Centralized Error Handling System**

The application implements a comprehensive error handling system following domain-driven design:

### **Critical Error Handling Principles**

1. **Domain Errors Only**: Domain layer throws business-specific errors, never generic exceptions
2. **No try-catch in Handlers**: Presenters focus on happy path, errors bubble up automatically
3. **Centralized HTTP Error Handling**: Single `HttpErrorHandler` service processes ALL errors
4. **Context-Aware Logging**: Every error includes correlation ID and request context for debugging

### **Error Class Hierarchy**
```
ApplicationError (base class)
├── DomainValidationError
│   ├── InvalidRequestError
│   └── SchemaValidationError
├── NotFoundError
├── ConflictError
├── UnauthorizedError
├── ForbiddenError
└── InvalidConfigError
```

### **Custom Error Creation Pattern**
📝 **Reference**: See existing errors in `src/domain/errors/` for implementation patterns

For ANY new domain entity, create specific domain errors that extend appropriate base classes:
- NotFoundError for missing resources
- ConflictError for business rule violations
- ValidationError for invalid input
- ApplicationError for other domain-specific errors

### **Mandatory Error Flow**
```
1. Domain Layer → Use Cases → Repository → Domain Errors (ValidationError, NotFoundError, ConflictError)
2. Repository Layer → Domain Errors when validation/business rules fail
3. Presentation Layer → NO ERROR HANDLING (bubbles up automatically)
4. HTTP Router → Centralized HttpErrorHandler → JSON Response
5. Client → Structured error response with correlation ID
```

### **Error Response Format**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": { "fieldErrors": {"entityId": ["Invalid format"]} }
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "requestId": "req_1640123456789_abc123"
}
```

### **Universal Error Handling Rules**

✅ **DO**: Create specific domain errors for each business entity
✅ **DO**: Let errors bubble up automatically to centralized handler
✅ **DO**: Throw errors from domain layer for business rule violations
✅ **DO**: Use proper error types (extends ApplicationError)

❌ **DON'T**: Try-catch in any business logic or presentation layer
❌ **DON'T**: Return null, undefined, or error codes instead of throwing errors
❌ **DON'T**: Use generic Error() or throw strings
❌ **DON'T**: Handle errors in multiple places (only in HttpRouter)

## HTTP Request Processing

The application uses a type-safe HTTP router with automatic handler discovery:

### **Universal Implementation Rules**
🔴 **CRITICAL**: "ưu tiên early return, tránh else nếu có thể" - Use early returns, avoid else when possible

🔴 **CRITICAL**: "handlers tập trung vào business logic, không phải error handling"

🔴 **CRITICAL**: "mọi trường hợp ngoại lệ đều phải throw error" - All exceptions must throw proper errors

🔴 **CRITICAL**: KHÔNG check error bằng `message.includes()` - Use proper error logic with instanceof

### **Mandatory Request Flow**
1. **Route Discovery**: Router automatically discovers all handlers via dependency injection
2. **Route Matching**: Path-to-regexp matching with type-safe parameter extraction
3. **Schema Validation**: `SchemaValidationService` validates route parameters using Zod schemas
4. **Handler Execution**: Clean handlers execute business logic, errors bubble up
5. **Centralized Error Handling**: Single `HttpErrorHandler` processes ALL errors consistently

### **Handler Interface**
📝 **Reference**: See `IRequestHandler` interface in `src/domain/interfaces/http-routing.interface`

**Required Properties**:
- `pathname`: Route pattern (e.g., "/entities/:id")
- `paramsSchema`: Zod schema for route parameters
- `bodySchema`: Optional Zod schema for request body
- `handle()`: Method to process requests

### **Handler Implementation Requirements**
📝 **Reference**: See existing handlers in `src/presentation/handlers/` for implementation patterns

**Required Pattern**:
- Implement `IRequestHandler` interface
- Define `pathname`, `paramsSchema`, `bodySchema`
- NO try-catch blocks - let errors bubble up
- Parse body → Validate schema → Execute use case → Return response

### **Handler Implementation Rules**
❌ **NEVER** catch errors in handlers - let errors bubble up to HttpRouter
✅ **ALWAYS** follow the pattern: Parse → Validate → Execute → Return

📝 **Reference**: See existing handlers for correct implementation patterns

### **Universal Anti-Patterns to Avoid**
🔴 **KHÔNG** tạo abstraction layers không cần thiết
🔴 **KHÔNG** handle errors ở nhiều nơi (chỉ centralized trong HttpRouter)
🔴 **KHÔNG** return null hoặc error codes thay vì throw proper errors
🔴 **KHÔNG** vi phạm dependency rules (dependencies must point inward)
🔴 **KHÔNG** đặt business logic trong presentation layer

### **Auto-Discovery System**
📝 **Reference**: See `src/container.ts` for handler registration patterns

All handlers registered with `TOKENS.REQUEST_HANDLER` token are automatically discovered by the HttpRouter.

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
- **Early Return**: Prefer early returns over nested if-else statements

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

## Adding New Features

### **Feature Implementation Pattern**
Follow this consistent pattern for ANY new feature:

1. **Domain Layer**:
   - Define entity in `domain/entities/`
   - Define interfaces in `domain/interfaces/` (repository, service contracts)
   - Define domain-specific errors in `domain/errors/`

2. **Application Layer**:
   - Create use case in `application/use-cases/`
   - Define DTOs in `application/dto/`
   - Follow the pattern: Validate → Execute → Return

3. **Infrastructure Layer**:
   - Implement repository in `infrastructure/repositories/`
   - Handle external concerns (database, APIs, file system)
   - Throw domain errors for business rule violations

4. **Presentation Layer**:
   - Create request handler in `presentation/handlers/`
   - Implement `IRequestHandler` interface
   - NO error handling - let errors bubble up

5. **Dependency Injection**:
   - Add tokens to `src/tokens.ts`
   - Register all dependencies in `src/container.ts`
   - Use `@injectable()` decorator on all classes

### **Implementation References**
📝 **Existing Patterns to Follow**:
- **Domain Entities**: See `src/domain/entities/`
- **Domain Interfaces**: See `src/domain/interfaces/`
- **Use Cases**: See `src/application/use-cases/`
- **Repositories**: See `src/application/use-cases/`
- **Handlers**: See `src/presentation/handlers/`
- **DTOs**: See `src/application/dto/`
- **Tokens**: See `src/tokens.ts`
- **DI Registration**: See `src/container.ts`