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

	// Use case tokens
	HELLO_WORLD_USE_CASE: createToken("HelloWorldUseCase"),
	HEALTH_CHECK_USE_CASE: createToken("HealthCheckUseCase"),
	CREATE_USER_USE_CASE: createToken("CreateUserUseCase"),
	GET_USER_USE_CASE: createToken("GetUserUseCase"),

	// Controller tokens
	HELLO_CONTROLLER: createToken("HelloController"),
	HEALTH_CONTROLLER: createToken("HealthController"),
	USER_CONTROLLER: createToken("UserController"),
} as const;
