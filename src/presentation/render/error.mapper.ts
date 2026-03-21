import {
	CustomerNotFoundError,
	InvoiceAmountMisMatch,
	InvoiceNotFoundError,
	RequestValidationError,
	ServiceUnhealthyError,
} from "../../domain/error";
import { InvalidJsonBodyError, InvalidRequestMethodError, InvalidTextBodyError } from "../error";

export interface ErrorResponse {
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

export class ErrorMapper {
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
			status: 503,
			errorClasses: [ServiceUnhealthyError],
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

	map(error: unknown): { status: number; body: ErrorResponse } {
		const status = this.getStatus(error);
		const body = this.formatBody(error, status);
		return { status, body };
	}

	private getStatus(error: unknown): number {
		const matched = this.errorMappings.find((mapping) =>
			mapping.errorClasses.some((errorClass) => error instanceof errorClass),
		);
		if (matched) {
			return matched.status;
		}
		return 500;
	}

	private formatBody(error: unknown, status: number): ErrorResponse {
		// Generic 500: hide internal details from client
		if (status === 500) {
			return { error: { message: "Internal server error" } };
		}

		// Known domain/presentation errors: safe to expose message
		if (error instanceof Error) {
			const body: ErrorResponse = { error: { message: error.message } };
			// Include details if error supports toJSON()
			if (this.hasToJson(error)) {
				body.error.details = error.toJSON();
			}
			return body;
		}

		return { error: { message: String(error) } };
	}

	private hasToJson(error: Error): error is Error & { toJSON(): unknown } {
		return "toJSON" in error && typeof (error as Record<string, unknown>).toJSON === "function";
	}
}
