import { spawnSync, execFileSync } from "child_process";
import * as fs from "fs";


export class Expect_Output {
	constructor(title, program_arguments, output, strip=false, encoding='utf8') {
		Object.assign(this, { title, program_arguments, output, strip, encoding });
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
			stdout = stdout.match(/^\s*(.*?)\s*$/s)[1];
		}

		if (stdout != this.output) {
			throw `Output mismatch for node ${this.program_arguments} → ${child.status} : ${JSON.stringify(stdout)} != ${JSON.stringify(this.output)}`
		}
	}

};

export class Expect_Crash {
	constructor(title, program_arguments) {
		Object.assign(this, { title, program_arguments });
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


//TODO - we could apply some DRY to this
export class Expect_NoCrash {
	constructor(title, program_arguments) {
		Object.assign(this, { title, program_arguments });
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

		if (child.status != 0) {
			throw `Failure when executing node ${this.program_arguments} → ${stdout} : ${stderr}`;
		}

	}

};


export function Run_Tests(list_of_tests) {
	for (const test of list_of_tests) {
		console.log('Test:', test.title);
		test.run();
	}
}