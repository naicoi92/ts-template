import type z from "zod";
import { formatZodError, RequestValidationError } from "../../domain/error/validation.error";
import type { Handler, Logger, RequestHandler, ResponseRender } from "../../domain/interface";
import type { ValidationErrorSource } from "../../domain/type/validation.type";
import { InvalidRequestMethodError } from "../error";
import type { RequestBodyParser } from "./body-parser";

export class RequestAdapter<TResponse, TParams, TQuery, TBody> implements RequestHandler<
	Request,
	Response
> {
	constructor(
		private readonly _deps: {
			logger: Logger;
			handler: Handler<TResponse, TParams, TQuery, TBody>;
			render: ResponseRender<TResponse, Response>;
			bodyParsers: RequestBodyParser[];
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
			// SAFETY INVARIANT: When a handler omits a schema (paramsSchema, querySchema,
			// bodySchema), the corresponding type parameter defaults to void.
			// undefined satisfies void in TypeScript, making these casts safe.
			// This correlation is guaranteed by the Handler interface contract.
			const data = await this.handler.handle({
				params: params as TParams,
				query: query as TQuery,
				body: body as TBody,
				headers: request.headers,
			});
			const response = this.schemaParse(data, this.handler.responseSchema, "response");
			return this.render.data(response);
		} catch (error) {
			return this.render.error(error);
		}
	}
	private parseQueries(searchParams: URLSearchParams): TQuery | undefined {
		if (!this.handler.querySchema) {
			return undefined;
		}
		const rawQuery = Object.fromEntries(searchParams.entries());
		return this.schemaParse(rawQuery, this.handler.querySchema, "query");
	}
	private async parseBody(request: Request): Promise<TBody | undefined> {
		if (!this.handler.bodySchema) {
			return undefined;
		}
		if (!this.methodHasBody(request.method)) {
			return undefined;
		}
		const body = await this.extractRequestBody(request);
		return this.schemaParse(body, this.handler.bodySchema, "body");
	}
	private parseParams(pathname: string): TParams | undefined {
		if (!this.handler.paramsSchema) {
			return undefined;
		}
		const params = new URLPattern({ pathname: this.handler.pathname }).exec({
			pathname,
		});
		return this.schemaParse(params?.pathname.groups, this.handler.paramsSchema, "params");
	}

	private async extractRequestBody(request: Request): Promise<unknown> {
		const contentType = request.headers.get("content-type");

		for (const parser of this._deps.bodyParsers) {
			if (parser.supports(contentType)) {
				return await parser.parse(request);
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
