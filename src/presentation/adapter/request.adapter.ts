import type z from "zod";
import { RequestValidationError } from "../../domain/error/validation.error";
import type { Handler, Logger, RequestHandler } from "../../domain/interface";
import { InvalidJsonBodyError, InvalidRequestMethodError, InvalidTextBodyError } from "../error";
import { ResponseFactory } from "../factory/response.factory";

export class RequestAdapter<TParams, TQuery, TBody> implements RequestHandler {
	constructor(
		private readonly _deps: {
			handler: Handler<TParams, TQuery, TBody>;
			logger: Logger;
		},
	) {}

	async handle(request: Request): Promise<Response> {
		try {
			const url = new URL(request.url);

			if (!this.hasMethod(request.method)) {
				throw new InvalidRequestMethodError(request.method);
			}

			const params = this.parseParams(url.pathname);
			const query = this.parseQueries(url.searchParams);
			const body = await this.parseBody(request);

			// Single log for successful parsing
			this.logger
				.withData({
					pathname: url.pathname,
					method: request.method,
					hasParams: !!params,
					hasQuery: !!query,
					hasBody: !!body,
				})
				.debug("Request parsed");

			return await this.handler.handle({ params, query, body });
		} catch (error) {
			if (error instanceof RequestValidationError) {
				this.logger
					.withData({ errors: error.errors })
					.warn("Request validation failed");
				return ResponseFactory.validationError(error.errors);
			}
			if (error instanceof SyntaxError) {
				this.logger.warn("Invalid request body");
				return ResponseFactory.badRequest("Invalid request body");
			}

			this.logger
				.withError(error instanceof Error ? error : new Error(String(error)))
				.error("Unexpected error in validation adapter");
			throw error;
		}
	}
	private parseQueries(searchParams: URLSearchParams): TQuery {
		if (!this.handler.querySchema) {
			return undefined as TQuery;
		}
		const rawQuery = Object.fromEntries(searchParams.entries());
		return this.schemaParse(rawQuery, this.handler.querySchema);
	}
	private async parseBody(request: Request): Promise<TBody> {
		if (!this.handler.bodySchema) {
			return undefined as TBody;
		}
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
		const params = new URLPattern({ pathname: this.handler.pathname }).exec({
			pathname,
		});
		return this.schemaParse(params?.pathname.groups, this.handler.paramsSchema);
	}

	private async extractRequestBody(request: Request): Promise<unknown> {
		const contentType = request.headers.get("content-type");
		if (contentType?.includes("application/json")) {
			try {
				return await request.json();
			} catch (error) {
				throw new InvalidJsonBodyError((error as Error).message);
			}
		}
		if (contentType?.includes("application/x-www-form-urlencoded")) {
			try {
				const bodyString = await request.text();
				const bodyParams = new URLSearchParams(bodyString);
				return Object.fromEntries(bodyParams.entries());
			} catch (error) {
				throw new InvalidTextBodyError((error as Error).message);
			}
		}
		return null;
	}

	private hasMethod(method: string): boolean {
		return this.handler.method === method;
	}

	private methodHasBody(method: string): boolean {
		return ["POST", "PUT", "PATCH"].includes(method);
	}

	private schemaParse<T>(data: unknown, schema: z.ZodSchema<T>): T {
		const result = schema.safeParse(data);
		if (result.success) return result.data;
		throw result.error;
	}

	private get handler(): Handler<TParams, TQuery, TBody> {
		return this._deps.handler;
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
