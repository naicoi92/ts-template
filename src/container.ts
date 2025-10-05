import "reflect-metadata";
import { container } from "tsyringe";
// Import use cases
import { CreateUserUseCase } from "@/application/use-cases/create-user.use-case";
import { GetUserUseCase } from "@/application/use-cases/get-user.use-case";
import { HealthCheckUseCase } from "@/application/use-cases/health-check.use-case";
import { HelloWorldUseCase } from "@/application/use-cases/hello-world.use-case";
// Import config
import { AppConfig } from "@/infrastructure/config/app.config";
// Import repositories
import { MemoryUserRepository } from "@/infrastructure/repositories/memory-user.repository";
// Import controllers
import { HealthController } from "@/presentation/controllers/health.controller";
import { HelloController } from "@/presentation/controllers/hello.controller";
import { UserController } from "@/presentation/controllers/user.controller";
// Import logger
import { LoggerService } from "@/shared/logger";
// Import tokens
import { TOKENS } from "@/tokens";

// Singleton services (shared instances across app)
container.registerSingleton(TOKENS.CONFIG_SERVICE, AppConfig);
container.registerSingleton(TOKENS.LOGGER_SERVICE, LoggerService);

// Singleton repositories
container.registerSingleton(TOKENS.USER_REPOSITORY, MemoryUserRepository);

// Register use cases
container.register(TOKENS.HELLO_WORLD_USE_CASE, HelloWorldUseCase);
container.register(TOKENS.HEALTH_CHECK_USE_CASE, HealthCheckUseCase);
container.register(TOKENS.CREATE_USER_USE_CASE, CreateUserUseCase);
container.register(TOKENS.GET_USER_USE_CASE, GetUserUseCase);

// Register controllers
container.register(TOKENS.HELLO_CONTROLLER, HelloController);
container.register(TOKENS.HEALTH_CONTROLLER, HealthController);
container.register(TOKENS.USER_CONTROLLER, UserController);

export { container };
