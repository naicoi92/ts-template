import { inject, injectable } from "tsyringe";
import type { HelloWorldUseCase } from "@/application/use-cases/hello-world.use-case";
import type { IRequestHandler } from "@/domain/interfaces/http-routing.interface";
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
export class HelloWorldRequestHandler implements IRequestHandler {
	readonly pathname = "/hello";
	readonly method = "GET";

	constructor(
		@inject(TOKENS.HELLO_WORLD_USE_CASE)
		private readonly helloWorldUseCase: HelloWorldUseCase,
	) {}

	/**
	 * Handles hello world requests
	 * @param _request - The incoming HTTP request (unused)
	 * @param _data - Validated request data (all empty for hello endpoint)
	 * @returns Promise resolving to HTTP response with hello message
	 */
	async handle(): Promise<Response> {
		// Execute hello world use case
		const helloResult = this.helloWorldUseCase.execute();

		// Return successful response
		return Response.json(helloResult, {
			status: 200,
			headers: {
				"Cache-Control": "public, max-age=60", // Cache for 1 minute
			},
		});
	}
}
