import type { FetchHandler, RequestHandler } from "../../domain/interface";

export class FetchAdapter implements FetchHandler {
	constructor(
		private handler: RequestHandler<undefined, undefined, undefined>,
	) {}
	async handle(request: Request): Promise<Response> {
		return await this.handler.handle({
			request,
			params: undefined,
			query: undefined,
			body: undefined,
		});
	}
}
