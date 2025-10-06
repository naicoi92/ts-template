import { container } from "@/container";
import type { IServer } from "@/domain/interfaces/server.interface";
import { TOKENS } from "@/tokens";

async function main() {
	const server = container.resolve<IServer>(TOKENS.SERVER);
	await server.start();
}

main()
	.catch((error) => {
		console.error("Error:", error);
		process.exit(1);
	})
	.finally(() => {
		process.exit(0);
	});
