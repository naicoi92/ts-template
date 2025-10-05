import { inject, injectable } from "tsyringe";
import type { HealthCheckUseCase } from "@/application/use-cases/health-check.use-case";
import { TOKENS } from "@/tokens";

@injectable()
export class HealthController {
	constructor(
		@inject(TOKENS.HEALTH_CHECK_USE_CASE)
		private healthCheckUseCase: HealthCheckUseCase,
	) {}

	async handle() {
		return await this.healthCheckUseCase.execute();
	}
}
