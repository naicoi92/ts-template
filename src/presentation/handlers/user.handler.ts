import { inject, injectable } from "tsyringe";
import type { CreateUserUseCase } from "@/application/use-cases/create-user.use-case";
import type { GetUserUseCase } from "@/application/use-cases/get-user.use-case";
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
	}
}
