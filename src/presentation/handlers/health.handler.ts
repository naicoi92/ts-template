import { inject, injectable } from "tsyringe";
import type { HealthCheckUseCase } from "@/application/use-cases/health-check.use-case";
import type { IRequestHandler } from "@/domain/interfaces/http-routing.interface";
import type { EmptyParams } from "@/domain/types";
import { EmptyParamsSchema } from "@/domain/types";
import { TOKENS } from "@/tokens";

/**
 * Health Request Handler
 *
 * Single Responsibility: Handles health check HTTP requests
 * - Only concerned with health check request processing
 * - Converts HTTP requests to use case calls
 * - Formats use case responses to HTTP responses
 */
@injectable()
export class HealthRequestHandler implements IRequestHandler<EmptyParams> {
	readonly pathname = "/health";
	readonly paramsSchema = EmptyParamsSchema;

	constructor(
		@inject(TOKENS.HEALTH_CHECK_USE_CASE)
		private readonly healthCheckUseCase: HealthCheckUseCase,
	) {}

	/**
	 * Handles health check requests
	 * @param _request - The incoming HTTP request (unused)
	 * @param _params - Empty parameters (type-safe from domain)
	 * @returns Promise resolving to HTTP response with health status
	 */
	async handle(_request: Request, _params: EmptyParams): Promise<Response> {
		// Execute health check use case
		const healthResult = await this.healthCheckUseCase.execute();

		// Return successful response
		return Response.json(healthResult, {
			status: 200,
			headers: {
				"Cache-Control": "no-cache, no-store, must-revalidate",
				Pragma: "no-cache",
				Expires: "0",
			},
		});
	}
}
