# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial starter template setup
- Clean Architecture folder structure
- Bun runtime configuration
- TypeScript strict mode
- Biome linter and formatter
- Kysely ORM setup with PostgreSQL
- Awilix dependency injection
- Zod validation schemas
- Structured logging with Pino
- Graceful shutdown handling
- Example domain entities (Invoice, Customer)
- Example use cases (CreateInvoice, GetInvoice)
- Example HTTP handlers
- Environment configuration with validation
- GitHub Actions CI workflow
- Issue templates (bug report, feature request)
- Pull request template
- VSCode settings and extensions
- EditorConfig

### Changed

- Converted from QR Payment service to generic starter template
- Updated package.json with proper scripts and metadata
- Enhanced README with comprehensive documentation

### Security

- Environment variables validated with Zod
- No sensitive data in repository

## [1.0.0] - 2026-03-01

### Added

- Initial release as TypeScript starter template
- Production-ready Clean Architecture setup
- Complete documentation

---

[Unreleased]: https://github.com/yourusername/bun-clean-architecture-starter/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/bun-clean-architecture-starter/releases/tag/v1.0.0
