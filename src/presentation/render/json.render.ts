import type { Logger, ResponseRender } from "../../domain/interface";

export class JsonRender<I = void> implements ResponseRender<I, Response> {
	constructor(private readonly _deps: { logger: Logger }) {}
	data(data: I): Promise<Response> {
		const response = Response.json(data);
		return Promise.resolve(response);
	}
	error(error: unknown): Promise<Response> {
		this.logger.withError(error as Error).error("Error rendering response");
		throw new Error("Method not implemented.");
	}
	private get logger(): Logger {
		return this._deps.logger;
	}
}
