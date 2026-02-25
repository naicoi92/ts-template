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
		try {
			const url = new URL(request.url);
			const params = this.parseParams(url.pathname);
			const query = this.parseQueries(url.searchParams);
			const body = await this.parseBody(request);
			return await this.handler.handle({ request, params, query, body });
		} catch (error) {
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
		const rawQuery = Object.fromEntries(searchParams.entries());
		return this.handler.querySchema.parse(rawQuery);
	}
	private async parseBody(request: Request): Promise<TBody> {
		if (!this.handler.bodySchema) {
			return undefined as TBody;
		}
		if (!this.methodHasBody(request.method)) {
			return undefined as TBody;
		}
		const rawBody = await this.extractRequestBody(request);
		return this.handler.bodySchema.parse(rawBody);
	}
	private parseParams(pathname: string): TParams {
		if (!this.handler.paramsSchema) {
			return undefined as TParams;
		}
		const params = this.handler.urlPattern.exec(pathname)?.pathname;
		return this.handler.paramsSchema.parse(params);
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

	private get handler(): RequestHandler<TParams, TQuery, TBody> {
		return this._deps.handler;
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
