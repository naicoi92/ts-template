import { inject, injectable } from "tsyringe";
import type { UserResponseDto } from "@/application/dto/user.dto";
import { NotFoundError } from "@/domain/errors/not-found.error";
import type { ILogger } from "@/domain/interfaces/logger.interface";
import type { IUserRepository } from "@/domain/interfaces/user.repository.interface";
import { TOKENS } from "@/tokens";

@injectable()
export class GetUserUseCase {
	constructor(
		@inject(TOKENS.USER_REPOSITORY) private userRepository: IUserRepository,
		@inject(TOKENS.LOGGER_SERVICE) private logger: ILogger,
	) {}

	async execute(id: string): Promise<UserResponseDto> {
		this.logger.withData({ userId: id }).info("Getting user by ID");

		const user = await this.userRepository.findById(id);

		if (!user) {
			throw new NotFoundError("User", id);
		}

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
		};
	}
}
