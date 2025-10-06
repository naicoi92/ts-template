import { inject, injectable } from "tsyringe";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import type { Config } from "@/domain/types/config.types";
import type { HelloWorldOutput } from "@/domain/types/use-case.types";
import { TOKENS } from "@/tokens";

@injectable()
export class HelloWorldUseCase {
	constructor(
		@inject(TOKENS.CONFIG_SERVICE) private config: Config,
		@inject(TOKENS.LOGGER_SERVICE) private logger: ILogger,
	) {}

	execute(): HelloWorldOutput {
		this.logger.info("Executing HelloWorld use case");

		return {
			message: "Hello, World!",
			appName: this.config.app.name,
			environment: this.config.nodeEnv,
			timestamp: new Date().toISOString(),
		};
	}
}
