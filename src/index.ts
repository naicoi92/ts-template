import { container } from "@/container";
import type { HealthController } from "@/presentation/controllers/health.controller";
import type { HelloController } from "@/presentation/controllers/hello.controller";
import type { UserController } from "@/presentation/controllers/user.controller";
import { TOKENS } from "@/tokens";

async function main() {
	// Get controllers from DI container
	const helloController = container.resolve<HelloController>(
		TOKENS.HELLO_CONTROLLER,
	);
	const healthController = container.resolve<HealthController>(
		TOKENS.HEALTH_CONTROLLER,
	);
	const userController = container.resolve<UserController>(
		TOKENS.USER_CONTROLLER,
	);

	// Test HelloWorld
	console.log("\n=== Hello World ===");
	const helloResult = await helloController.handle();
	console.log(helloResult);

	// Test Health Check
	console.log("\n=== Health Check ===");
	const healthResult = await healthController.handle();
	console.log(healthResult);

	// Test User Creation & Retrieval
	console.log("\n=== Create User ===");
	const newUser = await userController.createUser({
		name: "John Doe",
		email: "john@example.com",
	});
	console.log(newUser);

	console.log("\n=== Get User ===");
	const user = await userController.getUser(newUser.id);
	console.log(user);

	console.log("\n✅ Template is working correctly!");
}

main()
	.catch((error) => {
		console.error("Error:", error);
		process.exit(1);
	})
	.finally(() => {
		process.exit(0);
	});
