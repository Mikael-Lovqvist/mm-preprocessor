import { macro_pattern_factories } from "./template.js";
import { Regex_Rule, Regex_Matcher, concat_regular_expressions } from "./regex-matcher.js";

/* A future idea could be that we could switch or stack parsing rules in case we want sub-commands */

class Definition {
	constructor(name, value) {
		Object.assign(this, {name, value});
	}
}

export const parsing_rules = {
	flag: new Regex_Matcher('flag'),
	definition: new Regex_Matcher('definition', [
		new Regex_Rule(/^(\w+?)=(.*)$/, (matcher, name, value) => new Definition(name, value)),
		new Regex_Rule(/^(\w+)$/, (matcher, name, value) => new Definition(name, true)),
	]),
};


class Flag {
	init(argument_context) {
		if (this.options.default !== undefined) {
			argument_context.arguments[this.name] = this.options.default;
		}
	}
}


class Action_Flag extends Flag {
	constructor(name, flags, purpose, options={min_positional: 0, max_positional: 0, default: false}) {
		super();
		Object.assign(this, {name, purpose, flags, options});
	}

	register_parsing_rules(rule_list, argument_context) {
		for (const flag of this.flags) {
			rule_list.flag.rules.push(new Regex_Rule(concat_regular_expressions(/^/, flag, /$/), (matcher) => {


				const options = this.options;

				const positionals = [];
				while (argument_context.pending.length) {
					positionals.push(argument_context.pending.shift(0));
					if ((options.max_positional !== undefined) && positionals.length == options.max_positional) {
						break;
					}
				}

				if ((options.min_positional !== undefined) && positionals.length < options.min_positional) {
					const req = positionals.length ? positionals.length : 'none';
					throw `The flag '${flag}' requires at least ${options.min_positional} trailing arguments but only ${req} was given`;
				}

				//TODO - care about if this is a one time flag or if it could be repeated
				argument_context.arguments[this.name] = positionals;
				return true;
			}));
		}
	}
}



class Positional_Flag extends Flag {
	constructor(name, purpose, options={min_positional: 0, max_positional: 0, default: []}) {
		super();
		Object.assign(this, {name, purpose, options});
	}

	register_parsing_rules(rule_list, argument_context) {

		rule_list.flag.rules.push(new Regex_Rule(/^(.+)$/, (matcher, value) => {

			const options = this.options;
			const positionals = argument_context.arguments[this.name];
			positionals.push(value);

			//TODO - we can only check min_positional in a final stage which we have not added support for yet

			if ((options.max_positional !== undefined) && positionals.length > options.max_positional) {
				const req = positionals.length ? positionals.length : 'none';
				throw `The setting '${this.name}' can be specified at most ${options.max_positional} times`;
			}


			return true;
		}));
	}
}


class Settings_Flag extends Flag {
	constructor(name, flags, purpose, options={}) {
		super();
		Object.assign(this, {name, purpose, flags, options});
	}

	register_parsing_rules(rule_list, argument_context) {

		for (const flag of this.flags) {
			rule_list.flag.rules.push(new Regex_Rule(concat_regular_expressions(/^/, flag, /$/), (matcher) => {
				const value = argument_context.pending.shift(0);
				if (value === undefined) {
					throw `The flag '${flag}' requires an argument or has to take the form '${flag}=VALUE'`;
				}
				argument_context.arguments[this.name] = value;
				return true;
			}));

			rule_list.flag.rules.push(new Regex_Rule(concat_regular_expressions(/^/, flag, /=(.*)$/), (matcher, setting) => {
				argument_context.arguments[this.name] = setting;
				return true;
			}));

		}
	}

}



class Selection_Flag extends Flag {
	//TODO - add options for case sensitivity etc
	constructor(name, flags, purpose, selections, options={auto_group: false}) {
		super();
		Object.assign(this, {name, purpose, flags, selections, options});
	}

	register_parsing_rules(rule_list, argument_context) {

		const flag_ref = this;
		for (const flag of this.flags) {

			function verify_choice(value) {
				const choice = flag_ref.selections[value];
				if (choice === undefined) {
					throw `The choice ${JSON.stringify(value)} is invalid for the flag '${flag}'`;
				}
				argument_context.arguments[flag_ref.name] = choice;
			}

			rule_list.flag.rules.push(new Regex_Rule(concat_regular_expressions(/^/, flag, /$/), (matcher) => {
				verify_choice(argument_context.pending.shift(0));
				return true;
			}));

			rule_list.flag.rules.push(new Regex_Rule(concat_regular_expressions(/^/, flag, /=(.*)$/), (matcher, value) => {
				verify_choice(value);
				return true;
			}));

		}
	}

}

class Definition_Flag extends Flag {
	constructor(name, flags, purpose, options={}) {
		super();
		Object.assign(this, {name, purpose, flags, options});
	}

	init(argument_context) {
		if (this.options.default !== undefined) {
			argument_context.arguments[this.name] = this.options.default;
		} else {
			argument_context.arguments[this.name] = {};
		}
	}
	register_parsing_rules(rule_list, argument_context) {

		const flag_ref = this;
		for (const flag of this.flags) {

			function verify_value(matcher, value) {
				const definition = rule_list.definition.match(value);
				if (!definition) {
					throw `The definition given by'${matcher.state.value}' is malformed. It should be either "${flag}DEFINITION" or "${flag} DEFINITION" where DEFINITION is either "NAME=VALUE" or just "NAME" with implicit VALUE=TRUE`;
				}
				argument_context.arguments[flag_ref.name][definition.name] = definition.value;
			}

			rule_list.flag.rules.push(new Regex_Rule(concat_regular_expressions(/^/, flag, /$/), (matcher) => {
				verify_value(matcher, argument_context.pending.shift(0));
				return true;
			}));

			rule_list.flag.rules.push(new Regex_Rule(concat_regular_expressions(/^/, flag, /(.+)$/), (matcher, value) => {
				verify_value(matcher, value);
				return true;
			}));

		}
	}

}

export const flag_list = [

	new Action_Flag(		'help', 			['--help'], 	'Show help', 	{max_positional: 1, default: false}),
	new Action_Flag(		'exec', 			['--exec'], 	'Pre-execute script before running eval_definitions', 	{min_positional: 1, max_positional: 1, default: false}),

	new Definition_Flag(	'definitions', 		['-D'], 		'Specify definitions in context D'),
	new Definition_Flag(	'eval_definitions', ['-E'], 		'Specify definitions in context D but evaluate them just before reading the input files'),

	new Settings_Flag(		'encoding',			['--encoding'], 'Set encoding for input and output files (TODO)', {default: 'utf8'}),
	new Selection_Flag(		'style',			['--style'], 	(flag) => `Specify macro format style. Chose from: ${flag.format_choices()}`, macro_pattern_factories,  {auto_group: true, default: 'c_style'}),

	new Action_Flag(		'output',			['--output', '-o'], 'Set output file', {default: '/dev/stdout', min_positional: 1, max_positional: 1}),

	new Positional_Flag(	'input',			'Specify input files', {default: []}),

];

export function register_flags(flag_list, argument_context) {

	for (const flag of flag_list) {
		flag.init(argument_context);
		flag.register_parsing_rules(parsing_rules, argument_context);
	}

}