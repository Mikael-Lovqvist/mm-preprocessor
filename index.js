import { parse_arguments } from "./argument-parser.js";
import { load_template_from_file } from "./template.js";


export function main() {

	//const arg_context = parse_arguments(process.argv.slice(2));
	//TODO - care about arguments
	//console.log('positionals', arg_context.positionals);
	//console.log('definitions', arg_context.definitions);

	return;

	const template = load_template_from_file('test3.js');


	const out = template.execute({
		condition: false,
		other_thing: false,
		item: 'hello',
		DEFAULT_MESSAGE: JSON.stringify('No daylight for you!'),
		list_of_things: [
			'cookies',
			'coffee',
			'bacon',
		],
	});

	console.log(out);

}

