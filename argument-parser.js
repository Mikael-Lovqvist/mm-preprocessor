import { Regex_Rule, Regex_Matcher } from "./regex-matcher.js";

const dd_argument_matcher = new Regex_Matcher('double_dash_argument_matcher', [

	new Regex_Rule(	/^hello$/,	(matcher) => {
		console.log("Hello World!");
		return true;
	}),


]);

const sd_argument_matcher = new Regex_Matcher('single_dash_argument_matcher', [

	new Regex_Rule(	/^D(.+?)=(.*)$/,	(matcher, name, value) => {
		matcher.context.definitions[name] = value;
		return true;
	}),

	new Regex_Rule(	/^D$/,	(matcher) => {
		const definition = matcher.context.pending_arguments.shift();
		const dmatch = definition.match(/^(.+?)=(.*)$/);

		if (dmatch) {
			const [name, value] = dmatch.slice(1);
			matcher.context.definitions[name] = value;
			return true
		}
	}),


]);

const argument_matcher = new Regex_Matcher('argument_matcher', [
	new Regex_Rule(	/^--(.*)$/,	(matcher, name) => {
		dd_argument_matcher.state.parent = matcher;
		dd_argument_matcher.context = matcher.context;
		return dd_argument_matcher.match(name);
	}),
	new Regex_Rule(	/^-(.*)$/,	(matcher, name) => {
		sd_argument_matcher.state.parent = matcher;
		sd_argument_matcher.context = matcher.context;
		return sd_argument_matcher.match(name);
	}),
	new Regex_Rule(	/^(.*)$/,	(matcher, name) => {
		matcher.context.positionals.push(name);
		return true;
	}),
]);



export function parse_arguments(pending_arguments) {
	const file_list = [];

	argument_matcher.context.pending_arguments = pending_arguments;
	argument_matcher.context.positionals = [];
	argument_matcher.context.definitions = {};

	while (pending_arguments.length) {
		const arg = pending_arguments.shift();
		const match = argument_matcher.match(arg);
		if (!match) {
			throw `Unknown argument: ${arg}`;
		}
	}

	return argument_matcher.context;
}