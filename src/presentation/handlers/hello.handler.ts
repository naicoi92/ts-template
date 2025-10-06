import { inject, injectable } from "tsyringe";
import type { HelloWorldUseCase } from "@/application/use-cases/hello-world.use-case";
import type { IRequestHandler } from "@/domain/interfaces/http-routing.interface";
import type { EmptyParams } from "@/domain/types";
import { EmptyParamsSchema } from "@/domain/types";
import { TOKENS } from "@/tokens";

/**
 * Hello World Request Handler
 *
 * Single Responsibility: Handles hello world HTTP requests
 * - Only concerned with hello world request processing
 * - Converts HTTP requests to use case calls
 * - Formats use case responses to HTTP responses
 */
@injectable()
export class HelloWorldRequestHandler implements IRequestHandler<EmptyParams> {
	readonly pathname = "/hello";
	readonly paramsSchema = EmptyParamsSchema;

	constructor(
		@inject(TOKENS.HELLO_WORLD_USE_CASE)
		private readonly helloWorldUseCase: HelloWorldUseCase,
	) {}

	/**
	 * Handles hello world requests
	 * @param _request - The incoming HTTP request (unused)
	 * @param _params - Empty parameters (type-safe from domain)
	 * @returns Promise resolving to HTTP response with hello message
	 */
	async handle(_request: Request, _params: EmptyParams): Promise<Response> {
		try {
			// Execute hello world use case
			const helloResult = this.helloWorldUseCase.execute();

			// Return successful response
			return Response.json(helloResult, {
				status: 200,
				headers: {
					"Cache-Control": "public, max-age=60", // Cache for 1 minute
				},
			});
		} catch (error) {
			// Return error response
			return Response.json(
				{
					error: {
						code: "HELLO_ERROR",
						message: (error as Error).message,
					},
					timestamp: new Date().toISOString(),
				},
				{
					status: 500,
					headers: {
						"Cache-Control": "no-cache",
					},
				},
			);
		}
	}
}
