import type z from "zod";

export interface RequestHandler<
	TParams = unknown,
	TQuery = unknown,
	TBody = unknown,
> {
	readonly paramsSchema?: z.ZodSchema<TParams>;
	readonly querySchema?: z.ZodSchema<TQuery>;
	readonly bodySchema?: z.ZodSchema<TBody>;
	handle(data: {
		params: TParams;
		query: TQuery;
		body: TBody;
		request: Request;
	}): Promise<Response>;
}

export interface FetchHandler {
	handle(request: Request): Promise<Response>;
}
