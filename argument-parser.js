import { Regex_Rule, Regex_Matcher } from "./regex-matcher.js";

//TODO - use a factory for these

const dd_argument_matcher = new Regex_Matcher('double_dash_argument_matcher', [

	new Regex_Rule(	/^style=(.*)$/,	(matcher, style) => {
		matcher.context.style = style;
		return true;
	}),

	new Regex_Rule(	/^encoding=(.*)$/,	(matcher, encoding) => {
		matcher.context.encoding = encoding;
		return true;
	}),


	new Regex_Rule(	/^(.*)$/,	(matcher, flag) => {
		throw `Invalid double dash flag: "--${flag}"`
	}),

]);

//TODO - utilize some of our other better developed methods
const sd_argument_matcher = new Regex_Matcher('single_dash_argument_matcher', [

	new Regex_Rule(	/^D(.+?)=(.*)$/,	(matcher, name, value) => {
		matcher.context.definitions[name] = value;
		return true;
	}),

	new Regex_Rule(	/^D(.+)$/,	(matcher, name) => {
		matcher.context.definitions[name] = true;
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

		const dmatch2 = definition.match(/^(.+?)$/);

		if (dmatch2) {
			const [name] = dmatch2.slice(1);
			matcher.context.definitions[name] = true;
			return true
		}
	}),


	new Regex_Rule(	/^o(.+)$/,	(matcher, filename) => {
		matcher.context.output_file = filename;
		return true;
	}),

	new Regex_Rule(	/^o$/,	(matcher, filename) => {
		matcher.context.output_file = matcher.context.pending_arguments.shift();
		return true;
	}),

	new Regex_Rule(	/^(.*)$/,	(matcher, flag) => {
		throw `Invalid single dash flag: "-${flag}"`
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
	argument_matcher.context.output_file = '/dev/stdout';
	argument_matcher.context.style = 'c_style';
	argument_matcher.context.encoding = 'utf8';

	while (pending_arguments.length) {
		const arg = pending_arguments.shift();
		const match = argument_matcher.match(arg);
		if (!match) {
			throw `Unknown argument: ${arg}`;
		}
	}

	return argument_matcher.context;
}