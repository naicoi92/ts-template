import type z from "zod";
import { RequestValidationError } from "../../domain/error/validation.error";
import type {
	FetchHandler,
	Logger,
	RequestHandler,
} from "../../domain/interface";
import { ResponseFactory } from "../factory/response.factory";

export class FetchAdapter<TParams, TQuery, TBody> implements FetchHandler {
	constructor(
		private readonly _deps: {
			handler: RequestHandler<TParams, TQuery, TBody>;
			logger: Logger;
		},
	) {}

	async handle(request: Request): Promise<Response> {
		this.logger.withData({ request }).debug("Parsing request");
		try {
			const url = new URL(request.url);
			this.logger.withData({ url }).debug("Parsing request");
			const params = this.parseParams(url.pathname);
			this.logger.withData({ params }).debug("Parsed params");
			const query = this.parseQueries(url.searchParams);
			this.logger.withData({ query }).debug("Parsed queries");
			const body = await this.parseBody(request);
			this.logger.withData({ body }).debug("Parsed body");
			return await this.handler.handle({ request, params, query, body });
		} catch (error) {
			this.logger
				.withData({ error })
				.error("Unexpected error in validation adapter");
			if (error instanceof RequestValidationError) {
				this.logger
					.withData({
						errors: error.errors,
						method: request.method,
						url: request.url,
					})
					.warn("Request validation failed");
				return ResponseFactory.validationError(error.errors);
			}
			if (error instanceof SyntaxError) {
				this.logger
					.withData({
						method: request.method,
						url: request.url,
					})
					.warn("Invalid request body");
				return ResponseFactory.badRequest("Invalid request body");
			}

			this.logger
				.withData({
					error: error instanceof Error ? error.message : String(error),
					method: request.method,
					url: request.url,
				})
				.error("Unexpected error in validation adapter");
			throw error;
		}
	}
	private parseQueries(searchParams: URLSearchParams): TQuery {
		if (!this.handler.querySchema) {
			return undefined as TQuery;
		}
		this.logger.withData({ searchParams }).debug("Parsing queries");
		const rawQuery = Object.fromEntries(searchParams.entries());
		return this.schemaParse(rawQuery, this.handler.querySchema);
	}
	private async parseBody(request: Request): Promise<TBody> {
		if (!this.handler.bodySchema) {
			return undefined as TBody;
		}
		this.logger.withData({ request }).debug("Parsing body");
		if (!this.methodHasBody(request.method)) {
			return undefined as TBody;
		}
		const body = await this.extractRequestBody(request);
		return this.schemaParse(body, this.handler.bodySchema);
	}
	private parseParams(pathname: string): TParams {
		if (!this.handler.paramsSchema) {
			return undefined as TParams;
		}
		console.log(pathname);
		this.logger.withData({ pathname }).debug("Parsing params");
		const params = new URLPattern({ pathname: this.handler.pathname }).exec({
			pathname,
		});
		this.logger.withData({ params }).debug("Parsed params");
		return this.schemaParse(params?.pathname.groups, this.handler.paramsSchema);
	}

	private async extractRequestBody(request: Request): Promise<unknown> {
		const contentType = request.headers.get("content-type");
		if (contentType?.includes("application/json")) {
			try {
				return await request.json();
			} catch (error) {
				throw new Error(`Invalid JSON body: ${(error as Error).message}`);
			}
		}
		if (contentType?.includes("application/x-www-form-urlencoded")) {
			try {
				const bodyString = await request.text();
				const bodyParams = new URLSearchParams(bodyString);
				return Object.fromEntries(bodyParams.entries());
			} catch (error) {
				throw new Error(`Invalid TEXT body: ${(error as Error).message}`);
			}
		}
		return null;
	}

	private methodHasBody(method: string): boolean {
		return ["POST", "PUT", "PATCH"].includes(method);
	}

	private schemaParse<T>(data: unknown, schema: z.ZodSchema<T>): T {
		const result = schema.safeParse(data);
		if (result.success) return result.data;
		this.logger
			.withData({
				fields: result.error.flatten(),
			})
			.withError(result.error)
			.error("Invalid request body");
		throw result.error;
	}

	private get handler(): RequestHandler<TParams, TQuery, TBody> {
		return this._deps.handler;
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
