import {
	CustomerNotFoundError,
	InvoiceAmountMisMatch,
	InvoiceNotFoundError,
	RequestValidationError,
} from "../../domain/error";
import type { Logger, ResponseRender } from "../../domain/interface";
import {
	InvalidJsonBodyError,
	InvalidRequestMethodError,
	InvalidTextBodyError,
} from "../error";

interface ErrorResponse {
	error: {
		message: string;
		details?: unknown;
	};
}

type ErrorClass = new (...args: never[]) => Error;

interface ErrorMapping {
	status: number;
	errorClasses: readonly ErrorClass[];
}

export class JsonRender<I = void> implements ResponseRender<I, Response> {
	private readonly errorMappings: readonly ErrorMapping[] = [
		{
			status: 404,
			errorClasses: [InvoiceNotFoundError, CustomerNotFoundError],
		},
		{
			status: 405,
			errorClasses: [InvalidRequestMethodError],
		},
		{
			status: 400,
			errorClasses: [
				RequestValidationError,
				InvalidJsonBodyError,
				InvalidTextBodyError,
				InvoiceAmountMisMatch,
			],
		},
	];

	constructor(
		private readonly _deps: {
			logger: Logger;
		},
	) {}

	data(
		data: I,
		statusCode: number = 200,
		headers?: Record<string, string>,
	): Promise<Response> {
		const response = Response.json(data, {
			status: statusCode,
			headers,
		});
		return Promise.resolve(response);
	}

	error(error: unknown): Promise<Response> {
		const errorStatus = this.getErrorStatus(error);
		const errorBody = this.formatErrorBody(error);
		this.logger.withError(error as Error).error("Error occurred");
		const response = Response.json(errorBody, {
			status: errorStatus,
		});
		return Promise.resolve(response);
	}

	created(data: I, headers?: Record<string, string>): Promise<Response> {
		return this.data(data, 201, headers);
	}

	noContent(headers?: Record<string, string>): Promise<Response> {
		const response = new Response(null, {
			status: 204,
			headers,
		});
		return Promise.resolve(response);
	}

	private getErrorStatus(error: unknown): number {
		const matched = this.errorMappings.find((mapping) =>
			mapping.errorClasses.some((errorClass) => error instanceof errorClass),
		);

		if (matched) {
			return matched.status;
		}

		return 500;
	}

	private formatErrorBody(error: unknown): ErrorResponse {
		if (error instanceof RequestValidationError) {
			return {
				error: {
					message: error.message,
					details: error.toJSON(),
				},
			};
		}

		if (error instanceof Error) {
			return {
				error: {
					message: error.message,
				},
			};
		}

		return {
			error: {
				message: String(error),
			},
		};
	}

	private get logger(): Logger {
		return this._deps.logger;
	}
}
