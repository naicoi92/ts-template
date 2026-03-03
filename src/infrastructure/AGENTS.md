# INFRASTRUCTURE LAYER

External concerns: database, server, logging, configuration, services. Implements domain interfaces.

## STRUCTURE

```
infrastructure/
├── database/       # Kysely setup, Postgres dialect, DB types
├── repositories/   # Repository implementations (KyselyInvoiceRepository)
├── logger/         # LogLayer + Pino implementation, transports
├── config/         # AppConfig (Zod env parsing)
├── server/         # BunServer (Bun.serve wrapper)
└── service/        # Infrastructure services (InvoiceCodeGenerator, HealthCheck)
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add DB table | `database/types.ts` - add to Database interface |
| Implement repository | `repositories/kysely-*.repository.ts` |
| Configure logging | `logger/loglayer.logger.ts` |
| Add env variable | `domain/schema/env.schema.ts` + `config/app.config.ts` |
| Change server config | `server/bun.server.ts` |
| Add infra service | `service/*.service.ts` |

## PATTERNS

### Repository Implementation
```typescript
// repositories/kysely-invoice.repository.ts
export class KyselyInvoiceRepository implements InvoiceRepository {
  constructor(private _deps: { kysely: Kysely<Database>; logger: Logger }) {}

  async findByOrderId(orderId: string): Promise<Invoice> { // NOT null!
    const data = await this.kysely
      .selectFrom("invoices")
      .where("orderId", "=", orderId)
      .selectAll()
      .executeTakeFirstOrThrow()
      .catch((error) => {
        if (error instanceof NoResultError) {
          throw new InvoiceNotFoundError(orderId);
        }
        throw error;
      });
    return new Invoice(data);
  }
}
```

### Kysely Database
```typescript
// database/kysely.ts
export class KyselyDatabase extends Kysely<Database> {
  constructor(readonly _deps: { config: Config; logger: Logger }) {
    super({ 
      dialect: new KyselyPostgresDialect({ config }), 
      log: ["error", "query"] 
    });
  }
}
```

### Config (Direct Zod Parsing)
```typescript
// config/app.config.ts
export class AppConfig implements Config {
  #envConfig: EnvConfigDto;
  constructor() {
    this.#envConfig = EnvSchema.parse(process.env); // Direct Zod parsing
  }
  get server(): ServerConfig { return { port: this.#envConfig.PORT }; }
}
```

### Server Pattern
```typescript
// server/bun.server.ts
export class BunServer implements Server {
  constructor(private _deps: { config: Config; logger: Logger; routes: BunRoutes }) {}

  async start(): Promise<void> {
    this.#server = Bun.serve({
      port: this.config.server.port,
      routes: this.routes.routes, // From BunRoutes
    });
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
- **Throw domain errors** - Repositories throw `*NotFoundError` instead of returning null
- **Register in container** - New infrastructure classes must be registered in `container/register.ts`
