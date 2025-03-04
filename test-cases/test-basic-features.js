import { Expect_Output, Expect_Crash, Run_Tests } from "./testing-framework.js";

const test = ['../bin/cli.js', 'assets/basic-features.js'];

Run_Tests([
	new Expect_Output(	[...test, '-D', 'BUILD=debug'], 	'DEBUG', 		true),
	new Expect_Output(	[...test, '-D', 'BUILD=dev'], 		'DEVELOPMENT', 	true),
	new Expect_Output(	[...test, '-D', 'BUILD=prod'], 		'PRODUCTION', 	true),
	new Expect_Crash(	[...test, '-D', 'BUILD=blargh']),
]);
