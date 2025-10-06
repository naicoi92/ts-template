/**
 * Configuration Types
 *
 * Application configuration types
 * These are value objects, not mutable interfaces
 */

export type Config = {
	// Application
	readonly nodeEnv: string;
	readonly port: number;
	readonly version: string;
	readonly logLevel: string;

	// App configuration
	readonly app: {
		readonly name: string;
		readonly baseUrl: string;
	};

	// Helper methods
	readonly isDevelopment: boolean;
	readonly isProduction: boolean;
	readonly isTest: boolean;
	readonly isVercel: boolean;
};
