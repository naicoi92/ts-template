import { container } from "@/container";
import type { IAppBootstrap } from "@/domain/interfaces/app-bootstrap.interface";
import { TOKENS } from "@/tokens";

async function main() {
	const bootstrap = container.resolve<IAppBootstrap>(TOKENS.APP_BOOTSTRAP);
	await bootstrap.start();
}

main().catch((error) => {
	console.error("Failed to start application:", error);
	process.exit(1);
});
