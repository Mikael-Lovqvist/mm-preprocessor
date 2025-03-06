

import { flag_list, register_flags, parsing_rules } from "../../argument-flags.js";


const argument_context = {
	arguments: {},
	pending: process.argv.slice(2),

};

register_flags(flag_list, argument_context);



//Test parsing flags
while (argument_context.pending.length) {
	const flag = argument_context.pending.shift(0);
	parsing_rules.flag.match(flag);
}


console.log('Argument context', argument_context.arguments);