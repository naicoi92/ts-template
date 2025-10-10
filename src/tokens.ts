// Helper function to create namespaced tokens
const createToken = (name: string): symbol => Symbol.for(`ts-template.${name}`);

// Export all tokens as TOKENS object with Symbol tokens
export const TOKENS = {
	SERVER: createToken("Server"),
	// Repository tokens
	USER_REPOSITORY: createToken("UserRepository"),

	// Service tokens
	CONFIG_SERVICE: createToken("ConfigService"),
	LOGGER_SERVICE: createToken("LoggerService"),
	SCHEMA_VALIDATION_SERVICE: createToken("SchemaValidationService"),
	HTTP_ERROR_HANDLER: createToken("HttpErrorHandler"),
	HANDLER_FACTORY: createToken("HandlerFactory"),
	APP_BOOTSTRAP: createToken("AppBootstrap"),

	// Infrastructure tokens
	JSON_BODY_PARSER: createToken("JsonBodyParser"),

	// Use case tokens
	HELLO_WORLD_USE_CASE: createToken("HelloWorldUseCase"),
	HEALTH_CHECK_USE_CASE: createToken("HealthCheckUseCase"),
	CREATE_USER_USE_CASE: createToken("CreateUserUseCase"),
	GET_USER_USE_CASE: createToken("GetUserUseCase"),

	// Request Handler tokens (Clean Architecture)
	REQUEST_HANDLER: createToken("RequestHandler"),
	ROUTE_NOT_FOUND_HANDLER: createToken("RouteNotFoundHandler"),

	// HTTP Router token
	HTTP_ROUTER: createToken("HttpRouter"),
} as const;
