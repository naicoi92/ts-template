# BODY PARSER ADAPTERS

Strategy pattern for HTTP body parsing. Pluggable parsers for different content types.

## STRUCTURE

```
body-parser/
├── body-parser.interface.ts      # RequestBodyParser contract
├── json.body-parser.ts           # application/json parser
├── form-urlencoded.body-parser.ts # application/x-www-form-urlencoded parser
└── index.ts                      # Re-exports
```

## WHERE TO LOOK

| Task                      | Location                            |
| ------------------------- | ----------------------------------- |
| Add new content-type      | Create `*.body-parser.ts`           |
| Change parser contract    | `body-parser.interface.ts`          |

## PATTERNS

### Strategy Interface

```typescript
// body-parser.interface.ts
export interface RequestBodyParser {
	supports(contentType: string | null): boolean;
	parse(request: Request): Promise<unknown>;
}
```

### Concrete Parser

```typescript
// json.body-parser.ts
export class JsonBodyParser implements RequestBodyParser {
	supports(contentType: string | null): boolean {
		return contentType?.includes("application/json") ?? false;
	}

	async parse(request: Request): Promise<unknown> {
		try {
			return await request.json();
		} catch (error) {
			throw new InvalidJsonBodyError();
		}
	}
}
```

### Integration (RequestAdapter)

```typescript
// RequestAdapter iterates parsers
for (const parser of this.bodyParsers) {
	if (parser.supports(contentType)) {
		return await parser.parse(request);
	}
}
```

## RULES

- **One parser per content-type** - Single responsibility
- **Throw presentation errors** - `InvalidJsonBodyError`, `InvalidTextBodyError`
- **Register in DI** - Add to `bodyParsers` array in `container/register.ts`
- **Update index.ts** - Export new parsers for DI wiring

## ADDING NEW PARSER

1. Create `text.body-parser.ts` implementing `RequestBodyParser`
2. Throw domain-appropriate error on parse failure
3. Export from `index.ts`
4. Register in `container/register.ts` bodyParsers array
