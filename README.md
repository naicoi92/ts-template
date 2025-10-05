# TypeScript Clean Architecture Template

Template TypeScript với Clean Architecture, DI Container, và các best practices cho các dự án backend.

> **Lưu ý**: Đây là **starting template/boilerplate** để khởi tạo dự án mới, không phải là complete application. File `src/index.ts` chỉ là demo để verify setup hoạt động.

## Runtime Compatibility

Template này được thiết kế để tương thích với nhiều JavaScript runtimes:

- ✅ **Bun** (recommended) - Native TypeScript support, fast execution
- ✅ **Vercel Functions** - ESNext modules compatible
- ✅ **Cloudflare Workers / Edge Runtime** - Modern runtime support
- ✅ **Node.js** - Dev tự điều chỉnh module config nếu cần CommonJS

Build output sử dụng ESNext modules để tối đa hóa tính tương thích với modern runtimes.

## What This Template Provides

✅ **Clean Architecture Structure** - Domain, Application, Infrastructure, Presentation layers với separation rõ ràng

✅ **Dependency Injection Container** - TSyringe đã configured với token system type-safe

✅ **Example Implementations** - User entity, use cases, controllers để reference

✅ **Config Management** - Zod schema validation cho environment variables

✅ **Logger Service** - Tự động adapt theo môi trường (có sẵn Vercel detection)

✅ **Code Quality Tools** - Biome formatter/linter + Lefthook git hooks

## What You Need to Add

Để biến template này thành production application, bạn cần thêm:

⚠️ **Application Entry Point** - HTTP server (Hono, Express, Fastify) hoặc CLI phù hợp với runtime của bạn

⚠️ **Real Database Implementation** - Thay MemoryRepository bằng Prisma, Drizzle, hoặc adapter khác

⚠️ **Testing Setup** - Framework và test cases (Vitest, Jest, Bun test)

⚠️ **Authentication/Authorization** - Nếu dự án của bạn cần

⚠️ **API Documentation** - Swagger/OpenAPI nếu build REST API

## Tính năng

- ✅ **Clean Architecture**: Domain, Application, Infrastructure, Presentation layers
- ✅ **Dependency Injection**: TSyringe
- ✅ **Logger**: LogLayer với nhiều log levels
- ✅ **Config Management**: Zod schema validation cho environment variables
- ✅ **Memory Repository**: Repository pattern mẫu
- ✅ **Type Safety**: TypeScript strict mode
- ✅ **Code Quality**: Biome formatter & linter
- ✅ **Git Hooks**: Lefthook cho pre-commit và pre-push

## Cấu trúc thư mục

```
src/
├── application/        # Business logic & use cases
│   ├── dto/           # Data Transfer Objects
│   └── use-cases/     # Use cases
├── domain/            # Domain layer
│   ├── entities/      # Business entities
│   ├── errors/        # Custom errors
│   └── interfaces/    # Contracts/Interfaces
├── infrastructure/    # External concerns
│   ├── config/        # Configuration
│   └── repositories/  # Data persistence
├── presentation/      # API/Controllers
│   ├── controllers/   # Controllers
│   └── middleware/    # Middleware
├── shared/            # Shared utilities
│   ├── constants/     # Constants
│   └── logger.ts      # Logger service
├── container.ts       # DI container setup
├── tokens.ts          # DI tokens
└── index.ts           # Entry point
```

## Cài đặt

```bash
bun install
```

## Sử dụng

### Development

```bash
bun run dev
```

### Build

```bash
bun run build
```

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

## Mở rộng Template

### Thêm Entity mới

1. Tạo entity trong `src/domain/entities/`
2. Tạo interface repository trong `src/domain/interfaces/`
3. Implement repository trong `src/infrastructure/repositories/`

### Thêm Use Case mới

1. Tạo use case trong `src/application/use-cases/`
2. Đăng ký trong `src/container.ts`
3. Thêm token trong `src/tokens.ts`

### Thêm Controller mới

1. Tạo controller trong `src/presentation/controllers/`
2. Đăng ký trong `src/container.ts`
3. Thêm token trong `src/tokens.ts`

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
