/*
	Pending rules for integration into project
*/

import { Advanced_Regex_Tokenizer, Regex_Rule } from "./regex-matcher.js";

class Macro_Pattern {
	constructor(name, pattern, format_lambda) {
		Object.assign(this, {name, pattern, format_lambda});
	}

}


const macro_pattern_factories = {
	c_style: () => [
		new Macro_Pattern('c-multi-line', /\/\*\s*%%(.*?)%%\s*\*\//s, 	(text) => `/*${text}*/`),
		new Macro_Pattern('c-single-line', /\/\/\s*%%(.*?)\s*$/m, 		(text) => `//${text}`),
	],

	xml_style: () => [
		new Macro_Pattern('xml-multi-line', /<!--\s*%%(.*?)%%\s*-->/s, 	(text) => `<!--${text}-->`),
	],

	bash_style: () => [
		new Macro_Pattern('bash-multi-line', /: <<'%%'(.*?)^%%$/sm, 	(text) => `<!--${text}-->`),
		new Macro_Pattern('bash-single-line', /#\s*%%(.*?)\s*$/m, 		(text) => `//${text}`),
	],
};




function experiment(text, ruleset='c_style') {

	const tokenizer = new Advanced_Regex_Tokenizer(
		'tokenizer',
		macro_pattern_factories[ruleset](),
		(tokenizer, text) => ['DEFAULT', text],
	);


	for (const token of tokenizer.feed(text)) {
		console.log(token);
	}

}


experiment('hello /* %% big fat %% */ world!', 'c_style');
experiment('hello <!--%% big fat %%--> world!', 'xml_style');
experiment(`

export VAR=blargh
: <<'%%'
	this is my macro
	this is where I heal my hurts
%%

faithless;

`, 'bash_style');
