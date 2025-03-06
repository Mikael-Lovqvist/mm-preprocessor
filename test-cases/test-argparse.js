import { Expect_Output, Expect_Crash, Expect_NoCrash } from "./testing-framework.js";

const test = ['assets/argparse1.js'];


//TODO - actually verify output - improved coverage
export const test_list = [
	new Expect_NoCrash('Test argument parser success',	[...test, '-D', 'SOME_VAR', '-Estuff=(a, b) => emit(`$(a): $(b)`)', '--exec', 'path/to/file.js', '--help', 'chapter', '--encoding=ascii', 'inputfile1', 'inputfile2', '-o', 'outputfile']),
	new Expect_Crash('Test argument parser failure, space in value',	[...test, '-D', 'some var']),
	new Expect_Crash('Test argument parser failure, omitting required',	[...test, '--encoding']),
];

