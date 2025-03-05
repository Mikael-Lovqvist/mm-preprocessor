import { Expect_Output, Expect_Crash } from "./testing-framework.js";

const test = ['../bin/cli.js', 'assets/exec.js'];

export const test_list = [
	new Expect_Output('Pre execute file',	[...test, '--exec', 'assets/exec-test.js' ], 	'HELLO WORLD!', 	true),
];
