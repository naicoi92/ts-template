# TypeScript Clean Architecture Template

Template TypeScript với Clean Architecture, DI Container, và các best practices cho các dự án backend.

> **Lưu ý**: Đây là **starting template/boilerplate** để khởi tạo dự án mới, có sẵn HTTP server và application lifecycle management. Template đã sẵn sàng để phát triển tiếp.

## Runtime Compatibility

Template này được thiết kế để tương thích với nhiều JavaScript runtimes:

- ✅ **Bun** (recommended) - Native TypeScript support, fast execution
- ✅ **Vercel Functions** - ESNext modules compatible
- ✅ **Cloudflare Workers / Edge Runtime** - Modern runtime support
- ✅ **Node.js** - Dev tự điều chỉnh module config nếu cần CommonJS

Build output sử dụng ESNext modules để tối đa hóa tính tương thích với modern runtimes.

## What This Template Provides

✅ **Complete HTTP Server** - Bun HTTP server với proper error handling và routing

✅ **Application Lifecycle Management** - AppBootstrapService với graceful shutdown và signal handling

✅ **Clean Architecture Structure** - Domain, Application, Infrastructure, Presentation layers với separation rõ ràng

✅ **Dependency Injection Container** - TSyringe đã configured với token system type-safe

✅ **HTTP Request Handling** - Type-safe routing với automatic handler discovery

✅ **Error Handling System** - Centralized error handling với proper error types

✅ **Example Implementations** - User entity, use cases, handlers để reference

✅ **Config Management** - Zod v4 schema validation cho environment variables

✅ **Logger Service** - Tự động adapt theo môi trường (có sẵn Vercel detection)

✅ **Code Quality Tools** - Biome formatter/linter + Lefthook git hooks

## What You Need to Add for Production

Để biến template này thành production application, bạn cần thêm:

⚠️ **Real Database Implementation** - Thay MemoryRepository bằng Prisma, Drizzle, hoặc adapter khác

⚠️ **Testing Setup** - Framework và test cases (Vitest, Jest, Bun test)

⚠️ **Authentication/Authorization** - Nếu dự án của bạn cần

⚠️ **API Documentation** - Swagger/OpenAPI nếu build REST API

⚠️ **Monitoring & Metrics** - Health checks, metrics collection

## Tính năng

- ✅ **HTTP Server**: Bun HTTP server với routing và error handling
- ✅ **Application Lifecycle Management**: Graceful shutdown, signal handling
- ✅ **Request Handling**: Type-safe routing với automatic handler discovery
- ✅ **Error Handling**: Centralized error handling với proper error types
- ✅ **Clean Architecture**: Domain, Application, Infrastructure, Presentation layers
- ✅ **Dependency Injection**: TSyringe với token system
- ✅ **Logger**: LogLayer với nhiều log levels
- ✅ **Config Management**: Zod v4 schema validation cho environment variables
- ✅ **Memory Repository**: Repository pattern mẫu
- ✅ **Type Safety**: TypeScript strict mode
- ✅ **Code Quality**: Biome formatter & linter
- ✅ **Git Hooks**: Lefthook cho pre-commit và pre-push

## Cấu trúc thư mục

```
src/
├── application/        # Business logic & use cases
│   ├── dto/           # Data Transfer Objects
│   ├── services/      # Application services (HTTP router, error handler, bootstrap)
│   └── use-cases/     # Use cases
├── domain/            # Domain layer
│   ├── entities/      # Business entities
│   ├── errors/        # Custom errors
│   ├── interfaces/    # Contracts/Interfaces
│   ├── schemas/       # Domain schemas
│   ├── services/      # Domain services (schema validation)
│   └── types/         # Domain types
├── infrastructure/    # External concerns
│   ├── config/        # Configuration
│   ├── parsing/       # Request body parsing
│   ├── repositories/  # Data persistence
│   └── server/        # HTTP server implementations (Bun, Deno)
├── presentation/      # Entry points (API/Controllers)
│   └── handlers/      # Request handlers
├── shared/            # Shared utilities
│   └── logger.ts      # Logger service
├── container.ts       # DI container setup
├── tokens.ts          # DI tokens
└── index.ts           # Application entry point
```

## Cài đặt

```bash
bun install
```

## Sử dụng

### Development

```bash
bun run dev          # Dev mode với hot reload (Bun native watch)
```

Server sẽ start tại `http://localhost:3000` với các endpoints:
- `GET /health` - Health check
- `GET /hello` - Hello World example
- `POST /users` - Create user
- `GET /users/:id` - Get user by ID

### Build

```bash
bun run build        # Build với Bun bundler (fast, optimized)
bun run start        # Run production build
```

### Deployment (Vercel)

Template này đã được cấu hình sẵn để triển khai trên Vercel platform.

#### Các bước triển khai:

1. **Khởi tạo Vercel project:**
   ```bash
   vercel init
   ```

2. **Build cho Vercel:**
   ```bash
   bun run build:vercel
   ```

3. **Deploy lên production:**
   ```bash
   bun run deploy:vercel
   ```

#### Files cấu hình Vercel:

- `src/vercel.ts` - Entry point cho Vercel Functions
- `vercel.json` - Cấu hình routing và functions
- `package.json` - Scripts cho build và deploy

#### Tự động deployment:

Sau khi push code, Vercel sẽ tự động:
- Install dependencies với `bun install`
- Build application
- Deploy lên production

### Lint & Format

```bash
# Lint
bun run lint

# Lint & fix
bun run lint:fix

# Format
bun run format

# Type check
bun run type-check

# Check all (lint + type-check)
bun run check
```

## Zod v4 Schema Validation

Template này sử dụng **Zod v4** cho validation với các quy tắc sau:

### Import Syntax
```typescript
// ✅ Đúng - Default import
import z from "zod";
import type z from "zod";

// ❌ Sai - Named import
import { z } from "zod";
```

### Schema Syntax v4
```typescript
// Error messages
z.string().min(1, { error: "Field is required" })  // ✅ v4
// z.string().min(1, "Field is required")          // ❌ v3

// Top-level functions
z.email()                                          // ✅ v4
// z.string().email()                              // ❌ v3
z.url()                                            // ✅ v4
// z.string().url()                                // ❌ v3

// Transform + Default order
z.string().transform(Number).default(0)             // ✅ v4
// z.string().default("0").transform(Number)       // ❌ v3
```

### Schema Organization
- **Domain schemas** nằm trong `src/domain/schemas/`
- **Type exports** nằm trong `src/domain/types/` (inferred từ schemas)
- **Environment schema** nằm trong `src/domain/schemas/env.schema.ts`

### Best Practices
1. **Single source of truth**: Schema định nghĩa ở `schemas/`, types inferred ở `types/`
2. **Proper imports**: Luôn import từ đúng paths để maintain separation of concerns
3. **Zod v4 syntax**: Sử dụng latest syntax để tận dụng performance và type safety

## Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Các biến môi trường:

- `NODE_ENV`: Environment (development/production/test)
- `PORT`: Port server
- `APP_NAME`: Tên ứng dụng
- `APP_BASE_URL`: Base URL
- `LOG_LEVEL`: Log level (trace/debug/info/warn/error/fatal)

## Development Workflow

### Quy trình làm việc để tránh lỗi

1. **Luôn kiểm tra version**: Đảm bảo sử dụng đúng version của dependencies
2. **Tuân thủ syntax**: Sử dụng đúng syntax theo version hiện tại (Zod v4)
3. **Import paths**: Import từ đúng paths theo architecture:
   ```typescript
   // Schemas - từ domain/schemas
   import { UserSchema } from "@/domain/schemas";

   // Types - từ domain/types
   import type { UserType } from "@/domain/types";
   ```
4. **Test before commit**: Chạy `bun run check` trước khi commit
5. **Review changes**: Kiểm tra diff để đảm bảo không vi phạm architecture rules

### Common mistakes cần tránh

❌ **Không** import types từ schemas file
❌ **Không** sử dụng outdated syntax của dependencies
❌ **Không** vi phạm dependency rules (dependencies phải point inward)
❌ **Không** handle errors ở business logic layers (chỉ centralized trong HttpRouter)

## Mở rộng Template

### Thêm Entity mới

1. Tạo entity trong `src/domain/entities/`
2. Tạo interface repository trong `src/domain/interfaces/`
3. Implement repository trong `src/infrastructure/repositories/`

### Thêm Use Case mới

1. Tạo use case trong `src/application/use-cases/`
2. Tạo DTO trong `src/application/dto/` (nếu cần)
3. Đăng ký trong `src/container.ts`
4. Thêm token trong `src/tokens.ts`

### Thêm Request Handler mới

1. Tạo handler trong `src/presentation/handlers/`
2. Implement `IRequestHandler` interface với `pathname`, `paramsSchema`, `bodySchema`
3. Đăng ký trong `src/container.ts` với `TOKENS.REQUEST_HANDLER`
4. HTTP router sẽ tự động discovery handler mới

### Thêm Service mới

1. Tạo interface trong `src/domain/interfaces/`
2. Implement service trong `src/application/services/` (hoặc `infrastructure/` cho external concerns)
3. Đăng ký trong `src/container.ts`
4. Thêm token trong `src/tokens.ts`

### Application Lifecycle Customization

AppBootstrapService hỗ trợ các tùy chỉnh:
- Graceful shutdown timeout (default: 10s)
- Health check integration
- Custom startup/shutdown hooks

Xem `src/application/services/app-bootstrap.service.ts` để tùy chỉnh.

## Git Hooks

Template sử dụng Lefthook để tự động:

- **pre-commit**: Format code với Biome
- **pre-push**: Lint & type-check

Cài đặt hooks:

```bash
bunx lefthook install
```

## License

MIT
