/**
 * Application Bootstrap Interface
 *
 * Manages application lifecycle - startup and shutdown procedures
 * Following Clean Architecture: Domain layer with no external dependencies
 */

export interface IAppBootstrap {
	/**
	 * Starts the application
	 * - Sets up graceful shutdown handlers
	 * - Starts the server
	 * - Performs health checks
	 */
	start(): Promise<void>;

	/**
	 * Shuts down the application gracefully
	 * - Stops the server
	 * - Cleans up resources
	 * - Ensures proper exit codes
	 */
	shutdown(): Promise<void>;
}
