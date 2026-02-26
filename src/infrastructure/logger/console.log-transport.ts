import { ConsoleTransport } from "loglayer";
import type { Config } from "../../domain/interface";

export class LogConsoleTransport extends ConsoleTransport {
	constructor({ config }: { config: Config }) {
		super({
			enabled: config.log.onlyConsole,
			logger: console,
			appendObjectData: false,
			level: config.log.level,
		});
	}
}
