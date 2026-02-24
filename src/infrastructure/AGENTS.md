# INFRASTRUCTURE LAYER

External concerns: database, server, logging, configuration, routing. Implements domain interfaces.

## STRUCTURE

```
infrastructure/
├── database/       # Kysely setup, Postgres dialect, DB types
├── repositories/   # Repository implementations (KyselyInvoiceRepository)
├── logger/         # Loglayer + Pino implementation
├── config/         # AppConfig singleton, EnvConfigLoader
├── server/         # BunServer (Bun.serve wrapper)
└── router/         # Route definitions (InvoiceRouter)
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add DB table | `database/types.ts` - add to Database interface |
| Implement repository | `repositories/kysely-*.repository.ts` |
| Configure logging | `logger/loglayer.logger.ts` |
| Add env variable | `config/app.config.ts` + `domain/type/config.type.ts` |
| Add HTTP route | `router/*.router.ts` |
| Change server config | `server/bun.server.ts` |

## PATTERNS

### Repository Implementation
```typescript
// repositories/kysely-invoice.repository.ts
export class KyselyInvoiceRepository implements InvoiceRepository {
  constructor(private _deps: { database: KyselyDatabase; logger: Logger }) {}
  
  async findByOrderId(orderId: string): Promise<Invoice | null> {
    const row = await this.database
      .selectFrom("invoices")
      .where("orderId", "=", orderId)
      .selectAll()
      .executeTakeFirst();
    return row ? new Invoice(row) : null;
  }
}
```

### Kysely Database
```typescript
// database/kysely.ts
export class KyselyDatabase extends Kysely<Database> {
  constructor(readonly _deps: { config: Config; logger: Logger }) {
    super({ dialect: new KyselyPostgresDialect(_deps), log: ["error", "query"] });
  }
}
```

### Config Singleton
```typescript
// config/app.config.ts
export class AppConfig implements Config {
  static #instance: AppConfig;
  static get instance() {
    if (!this.#instance) this.#instance = new AppConfig(new EnvConfigLoader());
    return this.#instance;
  }
}
```

### Router Pattern
```typescript
// router/invoice.router.ts
export class InvoiceRouter implements BunRouter {
  constructor(private _deps: { createInvoiceUseCase: CreateInvoiceUseCase }) {}
  
  get routes() {
    return {
      "/invoices": { POST: this.handle.bind(this) },
    };
  }
}
```

## DEPENDENCIES

| Package | Purpose |
|---------|---------|
| `kysely` | Type-safe SQL query builder |
| `pg` | Postgres driver (used by Kysely dialect) |
| `loglayer` | Structured logging abstraction |
| `pino` / `pino-pretty` | Log transport |
| `awilix` | DI container (registered in `container/register.ts`) |

## RULES

- **Implement domain interfaces** - All classes implement contracts from `domain/interface/`
- **Inject via constructor** - Never import other infrastructure classes directly
- **Use Kysely, not raw pg** - All DB access through KyselyDatabase
- **Register in container** - New infrastructure classes must be registered in `container/register.ts`
