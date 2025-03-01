import { parse_arguments } from "./argument-parser.js";
import { load_template_from_file, run_in_scope } from "./template.js";


export function main() {

	//const arg_context = parse_arguments(process.argv.slice(2));
	//TODO - care about arguments
	//console.log('positionals', arg_context.positionals);
	//console.log('definitions', arg_context.definitions);


	const template = load_template_from_file('test2.js');

	const out = template.execute({
		condition: false,
		other_thing: false,
		item: 'not hello',
		DEFAULT_MESSAGE: JSON.stringify('No daylight for you!'),

		list_of_things: [
			'cookies',
			'coffee',
			'bacon',
		],

	});


	console.log('-- BEGIN EXPRESSION --');
	console.log(out);
	console.log('-- END EXPRESSION --');

	console.log()

	console.log('-- BEGIN EVAL --');
	run_in_scope(out, {
		cookies: 'Chocolate cookies',
		coffee: 'Black coffee',
		bacon: 'Fried pig slices',
	});
	console.log('-- END EVAL --');

}

