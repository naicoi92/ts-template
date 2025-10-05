import { inject, injectable } from "tsyringe";
import type { IConfig } from "@/domain/interfaces/config.interface";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import { TOKENS } from "@/tokens";

export interface HelloWorldOutput {
	message: string;
	appName: string;
	environment: string;
	timestamp: string;
}

@injectable()
export class HelloWorldUseCase {
	constructor(
		@inject(TOKENS.CONFIG_SERVICE) private config: IConfig,
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
