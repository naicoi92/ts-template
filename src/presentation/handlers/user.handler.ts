import { inject, injectable } from "tsyringe";
import type { CreateUserUseCase } from "@/application/use-cases/create-user.use-case";
import type { GetUserUseCase } from "@/application/use-cases/get-user.use-case";
import type { IRequestHandler } from "@/domain/interfaces/http-routing.interface";
import { CreateUserSchema, UserParamsSchema } from "@/domain/schemas";
import type { CreateUserInput, UserParams } from "@/domain/types";
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
	implements IRequestHandler<undefined, undefined, CreateUserInput>
{
	readonly pathname = "/users";
	readonly method = "POST";
	readonly bodySchema = CreateUserSchema;

	constructor(
		@inject(TOKENS.CREATE_USER_USE_CASE)
		private readonly createUserUseCase: CreateUserUseCase,
	) {}

	/**
	 * Handles create user requests
	 * @param _request - The incoming HTTP request (unused - body already validated)
	 * @param data - Validated request data containing body
	 * @returns Promise resolving to HTTP response with created user data
	 */
	async handle(
		_request: Request,
		data: { body: CreateUserInput },
	): Promise<Response> {
		// Execute create user use case with validated data
		const createdUser = await this.createUserUseCase.execute(data.body);

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
	readonly method = "GET";
	readonly paramsSchema = UserParamsSchema;

	constructor(
		@inject(TOKENS.GET_USER_USE_CASE)
		private readonly getUserUseCase: GetUserUseCase,
	) {}

	/**
	 * Handles get user requests
	 * @param _request - The incoming HTTP request (unused)
	 * @param data - Validated request data containing params
	 * @returns Promise resolving to HTTP response with user data
	 */
	async handle(
		_request: Request,
		data: {
			params: UserParams;
		},
	): Promise<Response> {
		// Execute get user use case with validated user ID
		const user = await this.getUserUseCase.execute(data.params.id);

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
