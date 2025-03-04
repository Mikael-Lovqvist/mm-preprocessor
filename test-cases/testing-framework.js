import { spawnSync, execFileSync } from "child_process";
import * as fs from "fs";


export class Expect_Output {
	constructor(program_arguments, output, strip=false, encoding='utf8') {
		Object.assign(this, { program_arguments, output, strip, encoding });
	}

	run() {
		const stdout_log = fs.openSync('/tmp/stdout.log', 'w');		//TODO - acquire named tempfiles in a safe manner
		const stderr_log = fs.openSync('/tmp/stderr.log', 'w');		//TODO - acquire named tempfiles in a safe manner

		const child = spawnSync('node', [...this.program_arguments], {
			stdio: ['ignore', stdout_log, stderr_log],
			encoding: this.encoding,
		});

		fs.closeSync(stdout_log);
		fs.closeSync(stderr_log);

		let stdout = fs.readFileSync('/tmp/stdout.log', this.encoding);
		let stderr = fs.readFileSync('/tmp/stderr.log', this.encoding);

		if (child.status) {
			throw `Failed to execute node ${this.program_arguments} → ${child.status} : ${stderr}`;
		}

		if (this.strip) {
			stdout = stdout.match(/^\s*(.*)\s*$/)[1];
		}

		if (stdout != this.output) {
			throw `Output mismatch for node ${this.program_arguments} → ${child.status} : ${stdout} != ${this.output}`
		}
	}

};

export class Expect_Crash {
	constructor(program_arguments) {
		Object.assign(this, { program_arguments });
	}

	run() {
		const stdout_log = fs.openSync('/tmp/stdout.log', 'w');		//TODO - acquire named tempfiles in a safe manner
		const stderr_log = fs.openSync('/tmp/stderr.log', 'w');		//TODO - acquire named tempfiles in a safe manner

		const child = spawnSync('node', [...this.program_arguments], {
			stdio: ['ignore', stdout_log, stderr_log],
			encoding: this.encoding,
		});

		fs.closeSync(stdout_log);
		fs.closeSync(stderr_log);

		let stdout = fs.readFileSync('/tmp/stdout.log', this.encoding);
		let stderr = fs.readFileSync('/tmp/stderr.log', this.encoding);

		if (child.status == 0) {
			throw `Unwanted success when executing node ${this.program_arguments} → ${stdout} : ${stderr}`;
		}

	}

};

export function Run_Tests(list_of_tests) {
	for (const test of list_of_tests) {
		console.log('Running', test);
		test.run();
	}
}