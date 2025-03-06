import { flag_list, register_flags, parsing_rules } from "./argument-flags.js";


export function parse_arguments(pending_arguments) {

	const argument_context = {
		arguments: {},
		pending: pending_arguments,
	};

	register_flags(flag_list, argument_context);

	while (argument_context.pending.length) {
		const flag = argument_context.pending.shift(0);
		parsing_rules.flag.match(flag);
	}

	return argument_context.arguments;

}