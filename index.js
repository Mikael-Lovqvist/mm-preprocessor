import { parse_arguments } from "./argument-parser.js";
import { load_template_from_file } from "./template.js";
import { run_in_scope } from "./function-utils.js";
import * as fs from "fs";


export function main() {
	const arg_context = parse_arguments(process.argv.slice(2));

	const template_scope = {template_arguments: arg_context};

	let result = '';

	if (!arg_context.positionals.length) {
		arg_context.positionals.push('/dev/stdin');
	}

	for (const input_file of arg_context.positionals) {
		const template = load_template_from_file(input_file, 'utf8', template_scope);
		const out = template.execute(arg_context.definitions);
		result += out;
	}

	fs.writeFileSync(arg_context.output_file, result, {
		encoding: 'utf8',
	});

}

