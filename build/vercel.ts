import { join } from "node:path";
import keys from "lodash-es/keys"
import {dependencies} from "../package.json"

const OUTPUT_DIR = "dist/vercel";
const ENTRYPOINT = "src/vercel.ts";

async function buildForVercel() {
	console.log("🚀 Building Vercel functions with Bun.build...");

	try {
		// Clean output directory
		console.log("🧹 Cleaning output directory...");
		await Bun.$`rm -rf ${OUTPUT_DIR}`;

		// Create output structure
		console.log("📁 Creating output structure...");
		await Bun.$`mkdir -p ${join(OUTPUT_DIR, "api")}`;

		// Build API endpoint
		console.log(`🔨 Building ${ENTRYPOINT}...`);
		const result = await Bun.build({
			entrypoints: [ENTRYPOINT],
			outdir: join(OUTPUT_DIR, "api"),
			target: "node",
			format: "esm",
			minify: true,
			sourcemap: "none",
			packages: "bundle",
      external: keys(dependencies),
		});

		if (!result.success) {
			console.error("❌ Build failed");
			for (const log of result.logs) {
				if (log.level === "error") console.error(log.message);
			}
			throw new Error("Build failed");
		}

		console.log(`   ✅ Successfully built ${ENTRYPOINT}`);
		for (const output of result.outputs) {
			console.log(`   📊 ${output.path} (${formatBytes(output.size)})`);
		}

		// Copy data files
		console.log("📦 Copying data files...");
		await Bun.$`cp -r assets ${OUTPUT_DIR}`;

		// Copy config files
		console.log("📦 Copying configuration files...");
		await Bun.write(
			join(OUTPUT_DIR, "vercel.json"),
			await Bun.file("vercel.json").text()
		);
		await Bun.write(
			join(OUTPUT_DIR, "package.json"),
			await Bun.file("package.json").text()
		);
		await Bun.write(
			join(OUTPUT_DIR, ".vercel", "project.json"),
			await Bun.file(".vercel/project.json").text()
		);

		console.log("✅ Build completed successfully!");
		console.log(`📂 Output directory: ${OUTPUT_DIR}`);

	} catch (error) {
		console.error("❌ Build failed:", error);
		process.exit(1);
	}
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Run build if this file is executed directly
if (import.meta.main) {
	await buildForVercel();
}

export { buildForVercel };
