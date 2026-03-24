import {
	CustomerNotFoundError,
	InvoiceAmountMisMatch,
	InvoiceNotFoundError,
	RequestValidationError,
	ServiceUnhealthyError,
} from "../../domain/error";
import type { Logger, ResponseRender } from "../../domain/interface";
import { ErrorMapper } from "./error.mapper";

export class JsonRender<I = void> implements ResponseRender<I, Response> {
	constructor(private readonly _deps: { errorMapper: ErrorMapper; logger: Logger }) {}

	data(data: I, statusCode: number = 200, headers?: Record<string, string>): Promise<Response> {
		const response = Response.json(data, { status: statusCode, headers });
		return Promise.resolve(response);
	}

	error(error: unknown): Promise<Response> {
		const { status, body } = this.errorMapper.map(error);
		if (status === 500) {
			const errorObj = error instanceof Error ? error : new Error(String(error));
			this.logger.withError(errorObj).error("Unexpected error");
		}
		const response = Response.json(body, { status });
		return Promise.resolve(response);
	}

	created(data: I, headers?: Record<string, string>): Promise<Response> {
		return this.data(data, 201, headers);
	}

	noContent(headers?: Record<string, string>): Promise<Response> {
		const response = new Response(null, { status: 204, headers });
		return Promise.resolve(response);
	}

	private get errorMapper(): ErrorMapper {
		return this._deps.errorMapper;
	}

	private get logger(): Logger {
		return this._deps.logger;
	}
}
