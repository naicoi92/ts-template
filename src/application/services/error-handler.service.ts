import { inject, injectable } from "tsyringe";
import { z } from "zod";
import { ApplicationError } from "@/domain/errors/application.error";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import { TOKENS } from "@/tokens";

/**
 * Error context information for better debugging
 */
interface ErrorContext {
	handlerName?: string;
	requestMethod?: string;
	requestPath?: string;
	params?: Record<string, unknown> | unknown;
	userId?: string;
	correlationId?: string;
}

/**
 * Formatted error response
 */
interface ErrorResponse {
	error: {
		code: string;
		message: string;
		details?: Record<string, unknown>;
	};
	timestamp: string;
	requestId?: string;
}

/**
 * HTTP Error Handler Service
 *
 * Single Responsibility: Centralized error handling and response formatting
 * - Maps domain errors to appropriate HTTP responses
 * - Provides consistent error response format
 * - Handles different error types with specific logic
 * - Includes proper logging with context
 */
@injectable()
export class HttpErrorHandler {
	constructor(
		@inject(TOKENS.LOGGER_SERVICE) private readonly logger: ILogger,
	) {}

	/**
	 * Handles errors and returns appropriate HTTP response
	 * @param error - The error that occurred
	 * @param context - Additional context information
	 * @returns Formatted HTTP error response
	 */
	handleError(error: Error, context?: ErrorContext): Response {
		const correlationId = this.generateCorrelationId();
		const fullContext = { ...context, correlationId };

		// Log error with full context
		this.logError(error, fullContext);

		// Handle different error types
		if (error instanceof z.ZodError) {
			return this.handleValidationError(error, fullContext);
		}

		if (error instanceof ApplicationError) {
			return this.handleApplicationError(error, fullContext);
		}

		// Handle unknown errors
		return this.handleUnknownError(error, fullContext);
	}

	/**
	 * Handles Zod validation errors
	 * @param error - The Zod validation error
	 * @param context - Error context
	 * @returns Validation error response
	 */
	private handleValidationError(
		error: z.ZodError,
		context: ErrorContext,
	): Response {
		const fieldErrors: Record<string, string[]> = {};

		error.issues.forEach((issue) => {
			const field = issue.path.join(".");
			if (!fieldErrors[field]) {
				fieldErrors[field] = [];
			}
			fieldErrors[field].push(issue.message);
		});

		const response: ErrorResponse = {
			error: {
				code: "VALIDATION_ERROR",
				message: this.getValidationErrorMessage(error, context),
				details: {
					fieldErrors,
					issues: error.issues.map((issue) => {
						const issueData: Record<string, unknown> = {
							field: issue.path.join("."),
							message: issue.message,
							code: issue.code,
						};

						// Add expected/received if available (for certain issue types)
						if ("expected" in issue) {
							issueData.expected = (issue as { expected: unknown }).expected;
						}
						if ("received" in issue) {
							issueData.received = (issue as { received: unknown }).received;
						}

						return issueData;
					}),
				},
			},
			timestamp: new Date().toISOString(),
			requestId: context.correlationId,
		};

		return Response.json(response, { status: 400 });
	}

	/**
	 * Gets appropriate validation error message based on context
	 * @param error - The Zod validation error
	 * @param context - Error context
	 * @returns Contextual error message
	 */
	private getValidationErrorMessage(
		error: z.ZodError,
		context: ErrorContext,
	): string {
		// Early return for routing parameter validation errors
		if (context.handlerName && context.requestPath) {
			const firstIssue = error.issues[0];
			if (firstIssue) {
				const field = firstIssue.path.join(".");
				return `Invalid route parameter '${field}' in ${context.requestPath}: ${firstIssue.message}`;
			}
		}

		// Default validation error message
		return "Request validation failed";
	}

	/**
	 * Handles application-specific errors
	 * @param error - The application error
	 * @param context - Error context
	 * @returns Application error response
	 */
	private handleApplicationError(
		error: ApplicationError,
		context: ErrorContext,
	): Response {
		const response: ErrorResponse = {
			error: error.toJSON(),
			timestamp: new Date().toISOString(),
			requestId: context.correlationId,
		};

		return Response.json(response, { status: error.statusCode });
	}

	/**
	 * Handles unknown errors
	 * @param error - The unknown error
	 * @param context - Error context
	 * @returns Internal server error response
	 */
	private handleUnknownError(error: Error, context: ErrorContext): Response {
		const isProduction = process.env.NODE_ENV === "production";
		const requestId = context.correlationId;

		const response: ErrorResponse = {
			error: {
				code: "INTERNAL_SERVER_ERROR",
				message: isProduction
					? "An unexpected error occurred. Please try again later."
					: error.message,
				...(isProduction ? {} : { stack: error.stack }),
			},
			timestamp: new Date().toISOString(),
			requestId,
		};

		return Response.json(response, { status: 500 });
	}

	/**
	 * Logs error with full context information
	 * @param error - The error that occurred
	 * @param context - Error context information
	 */
	private logError(error: Error, context: ErrorContext): void {
		const logEntry = this.logger.withError(error).withData({
			errorType: error.constructor.name,
			errorCode: error instanceof ApplicationError ? error.code : "UNKNOWN",
			handler: context.handlerName,
			method: context.requestMethod,
			path: context.requestPath,
			params: context.params,
			userId: context.userId,
			correlationId: context.correlationId,
		});

		// Early return for non-application errors
		if (!(error instanceof ApplicationError)) {
			logEntry.error("Unexpected error occurred");
			return;
		}

		// Handle application errors with appropriate log levels
		if (error.statusCode >= 500) {
			logEntry.error("Application error occurred");
			return;
		}

		if (error.statusCode >= 400) {
			logEntry.warn("Client error occurred");
			return;
		}

		logEntry.info("Application error occurred");
	}

	/**
	 * Generates a unique correlation ID for request tracking
	 * @returns Correlation ID string
	 */
	private generateCorrelationId(): string {
		return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	}
}
