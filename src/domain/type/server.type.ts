import type { BunRequest } from "bun";

export type BunHandler<T extends string> = (
	request: BunRequest<T>,
) => Promise<Response>;
