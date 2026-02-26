import { container } from "./container";

async function main() {
	await container.resolve("server").start();
}

main();
