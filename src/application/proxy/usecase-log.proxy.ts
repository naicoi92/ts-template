import type { Logger, UseCase } from "../../domain/interface";

export class UseCaseLogProxy<I, O> implements UseCase<I, O> {
	timeBegin: number = Date.now();
	constructor(
		private deps: {
			useCase: UseCase<I, O>;
			logger: Logger;
		},
	) {}
	async execute(input: I): Promise<O> {
		this.timeBegin = Date.now();
		try {
			const result = await this.useCase.execute(input);
			this.logger
				.withData({ input, executionTime: this.executionTime })
				.info("execute use case successfully");
			return result;
		} catch (error) {
			this.logger
				.withData({ input, executionTime: this.executionTime })
				.withError(error instanceof Error ? error : new Error(String(error)))
				.error("execute use case failed");
			throw error;
		}
	}

	get executionTime(): string {
		const executionTime = Date.now() - this.timeBegin;
		return `${executionTime}ms`;
	}

	private get useCase(): UseCase<I, O> {
		return this.deps.useCase;
	}
	private get logger(): Logger {
		return this.deps.logger;
	}
}
