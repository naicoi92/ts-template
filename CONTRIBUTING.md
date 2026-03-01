# Contributing to Bun Clean Architecture Starter

First off, thank you for considering contributing to this project! 🎉

## 📜 Code of Conduct

This project and everyone participating in it is governed by basic principles of respect and professionalism. By participating, you are expected to uphold this standard.

## 🤔 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and expected**
- **Include screenshots or animated GIFs if helpful**
- **Include your environment details** (OS, Bun version, Node version)

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain the expected behavior**
- **Explain why this enhancement would be useful**

### 🔧 Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the TypeScript and Clean Architecture patterns
- Include tests for new functionality
- Update documentation for changed functionality
- End all files with a newline

## 🛠️ Development Setup

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [PostgreSQL](https://www.postgresql.org/) >= 14
- Git

### Local Development

1. Fork and clone the repository

   ```bash
   git clone https://github.com/your-username/bun-clean-architecture-starter.git
   cd bun-clean-architecture-starter
   ```

2. Install dependencies

   ```bash
   bun install
   ```

3. Set up environment

   ```bash
   cp .env.example .env
   # Edit .env with your local database credentials
   ```

4. Run development server

   ```bash
   bun run dev
   ```

### Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server with hot reload |
| `bun run lint` | Run Biome linter |
| `bun run lint:fix` | Fix linting issues |
| `bun run format` | Format code |
| `bun run typecheck` | Run TypeScript checks |
| `bun run test` | Run tests |

## 📝 Coding Standards

### Clean Architecture Principles

1. **Domain layer** - No dependencies on outer layers
2. **Application layer** - Use cases orchestrate domain objects
3. **Infrastructure layer** - Implement interfaces from domain
4. **Presentation layer** - HTTP handlers and routes

### TypeScript Guidelines

- Use strict mode
- Avoid `any` type
- Use Zod for runtime validation
- Define types in `*.type.ts` files
- Define interfaces in `*.interface.ts` files
- Define schemas in `*.schema.ts` files

### Naming Conventions

- **Files**: kebab-case (e.g., `invoice-repository.interface.ts`)
- **Classes**: PascalCase (e.g., `InvoiceRepository`)
- **Variables/Functions**: camelCase (e.g., `getInvoiceById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)

### File Organization

```
src/
├── domain/          # Core business logic
├── application/     # Use cases
├── infrastructure/  # External concerns
├── presentation/    # HTTP layer
└── container/       # DI setup
```

## 🧪 Testing

- Write unit tests for domain entities
- Write integration tests for use cases
- Write e2e tests for API endpoints
- Aim for meaningful test coverage

## 📚 Documentation

- Update README.md for user-facing changes
- Update AGENTS.md for architecture changes
- Add JSDoc comments for public APIs
- Update type definitions as needed

## ❓ Questions?

Feel free to open an issue with the "question" label or start a discussion.

---

Thank you for your contributions! 🙏
