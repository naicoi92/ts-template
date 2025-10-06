import "reflect-metadata";
import { container } from "tsyringe";
// Import Application services
import { AppBootstrapService } from "@/application/services/app-bootstrap.service";
import { HttpErrorHandler } from "@/application/services/error-handler.service";
// Import HTTP Router
import { HttpRouter } from "@/application/services/http-router.service";
// Import use cases
import { CreateUserUseCase } from "@/application/use-cases/create-user.use-case";
import { GetUserUseCase } from "@/application/use-cases/get-user.use-case";
import { HealthCheckUseCase } from "@/application/use-cases/health-check.use-case";
import { HelloWorldUseCase } from "@/application/use-cases/hello-world.use-case";
// Import Domain services
import { SchemaValidationService } from "@/domain/services/schema-validation.service";
// Import config
import { AppConfig } from "@/infrastructure/config/app.config";
// Import Infrastructure services
import { JsonBodyParser } from "@/infrastructure/parsing/json-body-parser";
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

// Domain services (business logic, no external dependencies)
container.registerSingleton(
	TOKENS.SCHEMA_VALIDATION_SERVICE,
	SchemaValidationService,
);

// Application services
container.registerSingleton(TOKENS.HTTP_ERROR_HANDLER, HttpErrorHandler);
container.registerSingleton(TOKENS.APP_BOOTSTRAP, AppBootstrapService);

// Infrastructure services (external concerns)
container.registerSingleton(TOKENS.JSON_BODY_PARSER, JsonBodyParser);

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

export { container };
