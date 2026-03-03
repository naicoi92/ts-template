import type z from "zod";
import {
	formatZodError,
	RequestValidationError,
} from "../../domain/error/validation.error";
import type {
	Handler,
	Logger,
	RequestHandler,
	ResponseRender,
} from "../../domain/interface";
import type { ValidationErrorSource } from "../../domain/type/validation.type";
import {
	InvalidJsonBodyError,
	InvalidRequestMethodError,
	InvalidTextBodyError,
} from "../error";

export class RequestAdapter<TResponse, TParams, TQuery, TBody>
	implements RequestHandler<Request, Response>
{
	constructor(
		private readonly _deps: {
			logger: Logger;
			handler: Handler<TResponse, TParams, TQuery, TBody>;
			render: ResponseRender<TResponse, Response>;
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
			this.logger
				.withData({
					pathname: url.pathname,
					method: request.method,
					hasParams: !!params,
					hasQuery: !!query,
					hasBody: !!body,
				})
				.debug("Request parsed");
			const data = await this.handler.handle({ params, query, body });
			const response = this.schemaParse(
				data,
				this.handler.responseSchema,
				"response",
			);
			return this.render.data(response);
		} catch (error) {
			return this.render.error(error);
		}
	}
	private parseQueries(searchParams: URLSearchParams): TQuery {
		if (!this.handler.querySchema) {
			return undefined as TQuery;
		}
		const rawQuery = Object.fromEntries(searchParams.entries());
		return this.schemaParse(rawQuery, this.handler.querySchema, "query");
	}
	private async parseBody(request: Request): Promise<TBody> {
		if (!this.handler.bodySchema) {
			return undefined as TBody;
		}
		if (!this.methodHasBody(request.method)) {
			return undefined as TBody;
		}
		const body = await this.extractRequestBody(request);
		return this.schemaParse(body, this.handler.bodySchema, "body");
	}
	private parseParams(pathname: string): TParams {
		if (!this.handler.paramsSchema) {
			return undefined as TParams;
		}
		const params = new URLPattern({ pathname: this.handler.pathname }).exec({
			pathname,
		});
		return this.schemaParse(
			params?.pathname.groups,
			this.handler.paramsSchema,
			"params",
		);
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

	private schemaParse<T>(
		data: unknown,
		schema: z.ZodSchema<T>,
		source: ValidationErrorSource,
	): T {
		const result = schema.safeParse(data);
		if (result.success) return result.data;
		throw new RequestValidationError(formatZodError(result.error, source));
	}

	private get handler(): Handler<TResponse, TParams, TQuery, TBody> {
		return this._deps.handler;
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
	private get render(): ResponseRender<TResponse, Response> {
		return this._deps.render;
	}
}
