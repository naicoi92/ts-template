Plan: Move presentation error handler from infrastructure to presentation and wire up exports.
- Added new file: src/presentation/middleware/error-handler.middleware.ts
- Added barrel: src/presentation/middleware/index.ts
- Updated barrel in: src/presentation/index.ts to export from middleware
- Deleted: src/infrastructure/middleware/error-handler.middleware.ts
- Deleted: src/infrastructure/middleware/index.ts
- Updated: import paths in new error handler to use domain errors and presentation error adapters

Notes:
- Centralizes error-to-response mapping while preserving envelope shape.
- Keeps internal error messages hidden from clients; logs full details for debugging.
- Confirm that Presentation layer can reference the error handler without importing infrastructure.
