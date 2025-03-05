import { macro_pattern_factories } from "./template.js";


class Action_Flag {
	constructor(name, flags, purpose, options={min_positional: 0, max_positional: 0}) {
		Object.assign(this, {name, purpose, flags, options});
	}
}


class Settings_Flag {
	constructor(name, flags, purpose, options={}) {
		Object.assign(this, {name, purpose, flags, options});
	}
}

class Selection_Flag {
	constructor(name, flags, purpose, selections, options={auto_group: false}) {
		Object.assign(this, {name, purpose, flags, selections, options});
	}
}

class Definition_Flag {
	constructor(name, flags, purpose) {
		Object.assign(this, {name, purpose, flags});
	}
}

export const flag_list = [

	new Action_Flag(		'help', 			['--help'], 	'Show help', 	{max_positional: 1}),
	new Action_Flag(		'exec', 			['--exec'], 	'Pre-execute script before running eval_definitions', 	{min_positional: 1, max_positional: 1}),

	new Definition_Flag(	'definitions', 		['-D'], 		'Specify definitions in context D'),
	new Definition_Flag(	'eval_definitions', ['-E'], 		'Specify definitions in context D but evaluate them just before reading the input files'),

	new Settings_Flag(		'encoding',			['--encoding'], 'Set encoding for input and output files (TODO)'),
	new Selection_Flag(		'style',			['--style'], 	(flag) => `Specify macro format style. Chose from: ${flag.format_choices()}`, macro_pattern_factories,  {auto_group: true}),


];