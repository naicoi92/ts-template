import { inject, injectable } from "tsyringe";
import type { HelloWorldUseCase } from "@/application/use-cases/hello-world.use-case";
import { TOKENS } from "@/tokens";

@injectable()
export class HelloController {
	constructor(
		@inject(TOKENS.HELLO_WORLD_USE_CASE)
		private helloWorldUseCase: HelloWorldUseCase,
	) {}

	async handle() {
		return this.helloWorldUseCase.execute();
	}
}
