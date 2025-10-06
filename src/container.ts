import "reflect-metadata";
import { container } from "tsyringe";
// Import HTTP Router
import { HttpRouter } from "@/application/services/http-router.service";
// Import use cases
import { CreateUserUseCase } from "@/application/use-cases/create-user.use-case";
import { GetUserUseCase } from "@/application/use-cases/get-user.use-case";
import { HealthCheckUseCase } from "@/application/use-cases/health-check.use-case";
import { HelloWorldUseCase } from "@/application/use-cases/hello-world.use-case";
// Import config
import { AppConfig } from "@/infrastructure/config/app.config";
// Import repositories
import { MemoryUserRepository } from "@/infrastructure/repositories/memory-user.repository";
// Import Server
import { BunServer } from "@/infrastructure/server/bun.server";
// Import Request Handlers (Clean Architecture)
import { HealthRequestHandler } from "@/presentation/handlers/health.handler";
import { HelloWorldRequestHandler } from "@/presentation/handlers/hello.handler";
import {
	CreateUserRequestHandler,
	GetUserRequestHandler,
} from "@/presentation/handlers/user.handler";
// Import Logger
import { LoggerService } from "@/shared/logger";
// Import tokens
import { TOKENS } from "@/tokens";

// Register server
container.registerSingleton(TOKENS.SERVER, BunServer);

// Singleton services (shared instances across app)
container.registerSingleton(TOKENS.CONFIG_SERVICE, AppConfig);
container.registerSingleton(TOKENS.LOGGER_SERVICE, LoggerService);

// Singleton repositories
container.registerSingleton(TOKENS.USER_REPOSITORY, MemoryUserRepository);

// HTTP Router (singleton for shared instance)
container.registerSingleton(TOKENS.HTTP_ROUTER, HttpRouter);

// Register use cases
container.register(TOKENS.HELLO_WORLD_USE_CASE, HelloWorldUseCase);
container.register(TOKENS.HEALTH_CHECK_USE_CASE, HealthCheckUseCase);
container.register(TOKENS.CREATE_USER_USE_CASE, CreateUserUseCase);
container.register(TOKENS.GET_USER_USE_CASE, GetUserUseCase);

// Register Request Handlers (Clean Architecture)
// All handlers registered with same token for auto-discovery via injectAll
container.register(TOKENS.REQUEST_HANDLER, HealthRequestHandler);
container.register(TOKENS.REQUEST_HANDLER, HelloWorldRequestHandler);
container.register(TOKENS.REQUEST_HANDLER, CreateUserRequestHandler);
container.register(TOKENS.REQUEST_HANDLER, GetUserRequestHandler);

// Log successful registration
const logger = container.resolve<LoggerService>(TOKENS.LOGGER_SERVICE);
logger.info("HTTP Router and Request Handlers configured successfully");

export { container };
