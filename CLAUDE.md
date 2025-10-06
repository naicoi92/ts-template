# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
```bash
bun run dev          # Dev mode with hot reload (Bun native watch)
bun run build        # Build with Bun bundler (fast, single-file output)
bun run start        # Run production build
```

**Code Quality:**
```bash
bun run check        # Run lint + type-check (ALWAYS run before commit)
bun run lint:fix     # Auto-fix linting issues
```

**Git Hooks:**
- Pre-commit: Auto-format staged files
- Pre-push: Lint + type-check

Install hooks: `bunx lefthook install`

## 🔴 CRITICAL RULES

### **ZOD v4 REQUIREMENTS**
```typescript
// ✅ CORRECT
import z from "zod";
import type z from "zod";
z.string().min(1, { error: "Required" })
z.email()
z.string().transform(Number).default(0)

// ❌ WRONG
import { z } from "zod";
z.string().min(1, "Required")
z.string().email()
z.string().default("0").transform(Number)
```

### **SCHEMA ORGANIZATION**
- **Schemas**: `src/domain/schemas/` - Zod schema definitions
- **Types**: `src/domain/types/` - Inferred types FROM schemas
- **NEVER** import types directly from schema files
- **ALWAYS** import schemas from `@/domain/schemas`
- **ALWAYS** import types from `@/domain/types`

### **CLEAN ARCHITECTURE**
```
domain/          # Business logic (no external dependencies)
application/     # Use cases, orchestration
infrastructure/  # Database, HTTP, config
presentation/    # HTTP handlers only
```

**Dependency Rule**: All dependencies point INWARD → domain
**Error Handling**: Centralized in HttpRouter only
**No Business Logic** in presentation layer

## Core Principles

### **KISS + YAGNI**
- Làm ĐÚNG và ĐỦ yêu cầu, không thêm thắt
- Tránh over-engineering và abstraction không cần thiết

### **Early Return Pattern**
- Ưu tiên early return thay vì nested if-else
- Xử lý error cases ngay lập tức

### **Single Responsibility**
- Mỗi class/function chỉ có một trách nhiệm
- Handlers chỉ handle business logic, không handle errors

## Error Handling

**🔴 CRITICAL**: Error handling centralized trong HttpRouter

✅ **DO**: Throw proper domain errors, let them bubble up
❌ **DON'T**: Try-catch in handlers, return null/error codes

### **Error Flow**
```
Domain → Application → Presentation → HttpRouter → HttpErrorHandler → Client
```

### **Custom Errors**
Extend appropriate base classes in `src/domain/errors/`:
- `NotFoundError` for missing resources
- `ConflictError` for business rule violations
- `ValidationError` for invalid input

## HTTP Handlers

**Required Pattern**:
1. Implement `IRequestHandler` interface
2. Define `pathname`, `paramsSchema`, `bodySchema`
3. NO try-catch blocks - let errors bubble up
4. Parse → Validate → Execute → Return

## Dependency Injection

```typescript
import "reflect-metadata";
import { container } from "@/container";

@injectable()
class MyService {
  // ...
}

const service = container.resolve(TOKENS.MY_SERVICE);
```

## Adding Features

**Pattern**:
1. **Domain**: Entity, interfaces, errors
2. **Application**: Use case, DTOs
3. **Infrastructure**: Repository implementation
4. **Presentation**: Request handler
5. **DI**: Register in container.ts + tokens.ts

## 🔴 UNIVERSAL ANTI-PATTERNS

❌ **ZOD**: Named imports, v3 syntax, import types from schemas
❌ **ARCHITECTURE**: Handle errors outside HttpRouter, business logic in presentation
❌ **DEPENDENCIES**: Update without reading changelog, use outdated syntax
❌ **CODE QUALITY**: Commit without `bun run check`, ignore linting

## 🔥 GOLDEN RULES

1. **CHECK BEFORE CHANGE**: Always check version/docs before updating
2. **TEST SYNTAX**: Verify new syntax with examples before implementing
3. **FOLLOW PATTERNS**: Follow existing patterns in codebase
4. **ARCHITECTURE FIRST**: Never violate Clean Architecture
5. **SINGLE SOURCE**: Schemas in schemas/, types in types/