import { inject, injectable } from "tsyringe";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import type { IUserRepository } from "@/domain/interfaces/user.repository.interface";
import type { CreateUserInput } from "@/domain/schemas/user.schema";
import type { UserResponseDto } from "@/domain/types/dto.types";
import { TOKENS } from "@/tokens";

@injectable()
export class CreateUserUseCase {
	constructor(
		@inject(TOKENS.USER_REPOSITORY) private userRepository: IUserRepository,
		@inject(TOKENS.LOGGER_SERVICE) private logger: ILogger,
	) {}

	async execute(dto: CreateUserInput): Promise<UserResponseDto> {
		this.logger.info("Creating new user");

		const user = await this.userRepository.create({
			name: dto.name,
			email: dto.email,
		});

		this.logger.withData({ userId: user.id }).info("User created successfully");

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
		};
	}
}
