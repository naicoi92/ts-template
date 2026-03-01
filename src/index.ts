import { container } from "./container";
import type { Server } from "./domain/interface";

/**
 * Application Entry Point
 *
 * Responsibilities:
 * - Bootstrap the application
 * - Start the server
 * - Handle graceful shutdown
 */

async function main() {
	const server = container.resolve<Server>("server");

	// Handle graceful shutdown
	const shutdown = async (signal: string) => {
		console.log(`\nReceived ${signal}. Shutting down gracefully...`);
		try {
			await server.stop();
			console.log("Server stopped successfully");
			process.exit(0);
		} catch (error) {
			console.error("Error during shutdown:", error);
			process.exit(1);
		}
	};

	process.on("SIGINT", () => shutdown("SIGINT"));
	process.on("SIGTERM", () => shutdown("SIGTERM"));

	// Start the server
	try {
		await server.start();
		console.log("Application started successfully");
	} catch (error) {
		console.error("Failed to start application:", error);
		process.exit(1);
	}
}

main();
