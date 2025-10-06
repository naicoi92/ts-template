import { inject, injectable } from "tsyringe";
import type { CreateUserUseCase } from "@/application/use-cases/create-user.use-case";
import type { GetUserUseCase } from "@/application/use-cases/get-user.use-case";
import {
	InvalidRequestError,
	SchemaValidationError,
} from "@/domain/errors/validation.errors";
import type { IRequestHandler } from "@/domain/interfaces/http-routing.interface";
import type { IHttpRequestBodyParser } from "@/domain/interfaces/parsing.interface";
import type { ISchemaValidator } from "@/domain/interfaces/validation.interface";
import type { CreateUserInput } from "@/domain/schemas/user.schema";
import { CreateUserSchema } from "@/domain/schemas/user.schema";
import type { EmptyParams, UserParams } from "@/domain/types";
import { EmptyParamsSchema, UserParamsSchema } from "@/domain/types";
import { TOKENS } from "@/tokens";

/**
 * Create User Request Handler
 *
 * Single Responsibility: Handles create user HTTP requests
 * - Only concerned with creating users via HTTP
 * - Validates request body and converts to DTO
 * - Executes create user use case
 */
@injectable()
export class CreateUserRequestHandler
	implements IRequestHandler<EmptyParams, CreateUserInput>
{
	readonly pathname = "/users";
	readonly paramsSchema = EmptyParamsSchema;
	readonly bodySchema = CreateUserSchema;

	constructor(
		@inject(TOKENS.CREATE_USER_USE_CASE)
		private readonly createUserUseCase: CreateUserUseCase,
		@inject(TOKENS.JSON_BODY_PARSER)
		private readonly bodyParser: IHttpRequestBodyParser,
		@inject(TOKENS.SCHEMA_VALIDATION_SERVICE)
		private readonly schemaValidator: ISchemaValidator,
	) {}

	/**
	 * Handles create user requests
	 * @param request - The incoming HTTP request
	 * @param _params - Empty parameters (type-safe from domain)
	 * @returns Promise resolving to HTTP response with created user data
	 */
	async handle(request: Request, _params: EmptyParams): Promise<Response> {
		try {
			// Parse request body (Single Responsibility: HTTP parsing)
			const rawBody = await this.bodyParser.parse(request);

			// Validate parsed data against schema (Single Responsibility: domain validation)
			const createUserDto = this.schemaValidator.validate(
				rawBody,
				CreateUserSchema,
			);

			// Execute create user use case
			const createdUser = await this.createUserUseCase.execute(createUserDto);

			// Return successful response
			return Response.json(createdUser, {
				status: 201,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-cache",
				},
			});
		} catch (error) {
			// Return error response with proper error handling
			const statusCode = this.getErrorStatusCode(error as Error);
			const errorResponse = this.formatErrorResponse(error as Error);

			return Response.json(
				{
					error: errorResponse,
					timestamp: new Date().toISOString(),
				},
				{
					status: statusCode,
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "no-cache",
					},
				},
			);
		}
	}

	/**
	 * Formats error response for consistent API error handling
	 * @param error - Error object
	 * @returns Formatted error response
	 */
	private formatErrorResponse(error: Error): {
		code: string;
		message: string;
		details?: Record<string, string[]>;
	} {
		if (error instanceof SchemaValidationError) {
			return {
				code: error.code,
				message: error.message,
				details: error.fieldErrors,
			};
		}

		if (error instanceof InvalidRequestError) {
			return {
				code: error.code,
				message: error.message,
			};
		}

		return {
			code: this.getErrorCode(error),
			message: error.message,
		};
	}

	/**
	 * Gets appropriate HTTP status code for error
	 * @param error - Error object
	 * @returns HTTP status code
	 */
	private getErrorStatusCode(error: Error): number {
		// Handle domain validation errors
		if (
			error instanceof SchemaValidationError ||
			error instanceof InvalidRequestError
		) {
			return 400; // Bad Request
		}

		const message = error.message.toLowerCase();

		if (message.includes("required") || message.includes("invalid")) {
			return 400; // Bad Request
		}

		if (message.includes("already exists") || message.includes("duplicate")) {
			return 409; // Conflict
		}

		return 500; // Internal Server Error
	}

	/**
	 * Gets error code for error response
	 * @param error - Error object
	 * @returns Error code string
	 */
	private getErrorCode(error: Error): string {
		const message = error.message.toLowerCase();

		if (message.includes("name")) {
			return "INVALID_NAME";
		}

		if (message.includes("email")) {
			return "INVALID_EMAIL";
		}

		if (message.includes("json")) {
			return "INVALID_JSON";
		}

		return "CREATE_USER_ERROR";
	}
}

/**
 * Get User Request Handler
 *
 * Single Responsibility: Handles get user HTTP requests
 * - Only concerned with retrieving users via HTTP
 * - Extracts user ID from route parameters
 * - Executes get user use case
 */
@injectable()
export class GetUserRequestHandler implements IRequestHandler<UserParams> {
	readonly pathname = "/users/:id";
	readonly paramsSchema = UserParamsSchema;

	constructor(
		@inject(TOKENS.GET_USER_USE_CASE)
		private readonly getUserUseCase: GetUserUseCase,
	) {}

	/**
	 * Handles get user requests
	 * @param _request - The incoming HTTP request (unused)
	 * @param params - Route parameters containing validated user ID (type-safe from domain)
	 * @returns Promise resolving to HTTP response with user data
	 */
	async handle(_request: Request, params: UserParams): Promise<Response> {
		try {
			// Execute get user use case with validated user ID
			const user = await this.getUserUseCase.execute(params.id);

			// Return successful response
			return Response.json(user, {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "private, max-age=300", // Cache for 5 minutes
				},
			});
		} catch (error) {
			// Return error response
			const statusCode = this.getErrorStatusCode(error as Error);

			return Response.json(
				{
					error: {
						code: this.getErrorCode(error as Error),
						message: (error as Error).message,
					},
					timestamp: new Date().toISOString(),
				},
				{
					status: statusCode,
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "no-cache",
					},
				},
			);
		}
	}

	/**
	 * Gets appropriate HTTP status code for error
	 * @param error - Error object
	 * @returns HTTP status code
	 */
	private getErrorStatusCode(error: Error): number {
		const message = error.message.toLowerCase();

		if (message.includes("not found") || message.includes("id")) {
			return 404; // Not Found
		}

		if (message.includes("required") || message.includes("invalid")) {
			return 400; // Bad Request
		}

		return 500; // Internal Server Error
	}

	/**
	 * Gets error code for error response
	 * @param error - Error object
	 * @returns Error code string
	 */
	private getErrorCode(error: Error): string {
		const message = error.message.toLowerCase();

		if (message.includes("not found")) {
			return "USER_NOT_FOUND";
		}

		if (message.includes("id")) {
			return "INVALID_USER_ID";
		}

		return "GET_USER_ERROR";
	}
}
