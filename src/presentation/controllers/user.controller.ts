import { inject, injectable } from "tsyringe";
import type { CreateUserDto } from "@/application/dto/user.dto";
import type { CreateUserUseCase } from "@/application/use-cases/create-user.use-case";
import type { GetUserUseCase } from "@/application/use-cases/get-user.use-case";
import { TOKENS } from "@/tokens";

@injectable()
export class UserController {
	constructor(
		@inject(TOKENS.CREATE_USER_USE_CASE)
		private createUserUseCase: CreateUserUseCase,
		@inject(TOKENS.GET_USER_USE_CASE) private getUserUseCase: GetUserUseCase,
	) {}

	async createUser(dto: CreateUserDto) {
		return await this.createUserUseCase.execute(dto);
	}

	async getUser(id: string) {
		return await this.getUserUseCase.execute(id);
	}
}
