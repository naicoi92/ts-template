import { LogLevel } from "../../src/domain/enum";
import type { Config } from "../../src/domain/interface";

const DEFAULT_TEST_CONFIG: Config = {
	name: "test-app",
	database: { url: "postgresql://test:test@localhost:5432/test_db" },
	log: { level: LogLevel.DEBUG, onlyConsole: true },
	server: { port: 3001 },
};

export class MockConfig implements Config {
	private _config: Config;

	constructor(overrides: Partial<Config> = {}) {
		this._config = {
			...DEFAULT_TEST_CONFIG,
			...overrides,
			database: { ...DEFAULT_TEST_CONFIG.database, ...overrides.database },
			log: { ...DEFAULT_TEST_CONFIG.log, ...overrides.log },
			server: { ...DEFAULT_TEST_CONFIG.server, ...overrides.server },
		};
	}

	get name() { return this._config.name; }
	get database() { return this._config.database; }
	get log() { return this._config.log; }
	get server() { return this._config.server; }
}

export function createMockConfig(overrides: Partial<Config> = {}): MockConfig {
	return new MockConfig(overrides);
}
