import { Expect_Output, Expect_Crash } from "./testing-framework.js";

const test = ['../bin/cli.js', 'assets/basic-features.js'];

export const test_list = [
	new Expect_Output('Existing switch case "DEBUG"',			[...test, '-D', 'BUILD=debug'], 	'DEBUG', 		true),
	new Expect_Output('Existing switch case "DEVELOPMENT"', 	[...test, '-D', 'BUILD=dev'], 		'DEVELOPMENT', 	true),
	new Expect_Output('Existing switch case "PRODUCTION"', 		[...test, '-D', 'BUILD=prod'], 		'PRODUCTION', 	true),
	new Expect_Crash('Failed switch case "blargh"', 			[...test, '-D', 'BUILD=blargh']),
];
