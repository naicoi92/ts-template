import { PinoTransport } from "@loglayer/transport-pino";
import pino from "pino";
import pretty from "pino-pretty";
import type { Config } from "../../domain/interface";
export class LogPinoTransport extends PinoTransport {
	constructor({ config }: { config: Config }) {
		super({
			enabled: !config.log.onlyConsole,
			level: config.log.level,
			logger: pino(
				pretty({
					colorize: true,
				}),
			),
		});
		this.logger.level = config.log.level;
	}
}
