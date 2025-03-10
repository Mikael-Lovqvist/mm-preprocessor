import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { context } from "./context.js";

// Cleanup function
async function cleanup() {
	if (context.temp_dir) {
		await fs.rm(context.temp_dir, { recursive: true }).catch((e) => {
			console.log("Failed to clean", e);
		});
		context.temp_dir = undefined
	}
}

export function install_cleanup_function() {

	// Register exit hooks
	const exitEvents = ["exit", "SIGINT", "SIGTERM", "SIGHUP", "SIGUSR1", "SIGUSR2", "uncaughtException", "beforeExit"];

	exitEvents.forEach(event => {
		process.on(event, async (err) => {
			await cleanup();
			if (event === "uncaughtException") {
				console.error("Uncaught Exception:", err);
				process.exit(1); // Ensure exit
			}
			process.exit(0);
		});
	});

}