import type { BunHandler } from "../type/server.type";

export interface Server {
	start(): Promise<void>;
	stop(): Promise<void>;
}

export interface BunRouter {
	get routes(): Record<string, Record<string, BunHandler<string>>>;
}
