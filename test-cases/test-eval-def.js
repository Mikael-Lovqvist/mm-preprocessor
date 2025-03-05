import { Expect_Output, Expect_Crash } from "./testing-framework.js";

const test = ['../bin/cli.js', 'assets/call-do_thrice.js'];

export const test_list = [
	new Expect_Output('Define expression using -E',	[...test, '-E', 'do_thrice=A => { A(); A(); A(); }' ], 	'HELLO HELLO HELLO', 	true),
];
