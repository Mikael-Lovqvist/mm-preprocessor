import { Advanced_Regex_Tokenizer, Regex_Rule } from "./regex-matcher.js";
import { run_in_scope } from "./function-utils.js";

import * as fs from "fs";

class Macro_Pattern {
	constructor(name, pattern, format_lambda) {
		Object.assign(this, {name, pattern, format_lambda});
	}
}

class Default_Macro_Pattern {
	constructor(name, format_lambda = (text) => text) {
		Object.assign(this, {name, format_lambda});
	}
}


export const macro_pattern_factories = {
	c_style: () => [
		new Macro_Pattern('c-multi-line', /\/\*\s*%%(.*?)%%\s*\*\//s, 	(text) => `/*${text}*/`),
		new Macro_Pattern('c-single-line', /\/\/\s*%%(.*?)\s*$/m, 		(text) => `//${text}\n`),
	],

	xml_style: () => [
		new Macro_Pattern('xml-multi-line', /<!--\s*%%(.*?)%%\s*-->/s, 	(text) => `<!--${text}-->`),
	],

	bash_style: () => [
		new Macro_Pattern('bash-multi-line', /^:\s*<<\s*'%%'\s*$(.*?)^\s*%%$/sm, 	(text) => `: << '%%'\n${text}\n%%\n`),
		new Macro_Pattern('bash-single-line', /#\s*%%(.*?)\s*$/m, 					(text) => `#${text}\n`),
	],
};


//Shortcuts
macro_pattern_factories.c = macro_pattern_factories.c_style;
macro_pattern_factories.xml = macro_pattern_factories.xml_style;
macro_pattern_factories.bash = macro_pattern_factories.bash_style;


export class Template {
	constructor(expression, info) {
		this.expression = expression;
		Object.assign(this, info);
	}

	execute(scope) {
		return run_in_scope(this.expression, scope);
	}

}

export function load_template_from_file(filename, ruleset, encoding='utf8', template_scope={}) {
	const source = fs.readFileSync(filename, encoding);
	const template = new Template(null, {filename, encoding});
	template.expression = parse_template(source, ruleset, {
		template: template,
		...template_scope,
	})
	return template;

}


//TODO - this should be built based on some ground truth + whatever style added
const rule_formatters = {
	'text': (tokenizer, text) => {
		const context = tokenizer.context;
		context.pending_expression += `emit(${JSON.stringify(text)});`;
	},

	'c-multi-line': (tokenizer, text) => {
		const context = tokenizer.context;
		context.pending_expression += text;
	},

	'c-single-line': (tokenizer, text) => {
		const context = tokenizer.context;
		context.pending_expression += text;
	},

	'xml-multi-line': (tokenizer, text) => {
		const context = tokenizer.context;
		context.pending_expression += text;
	},

	'bash-multi-line': (tokenizer, text) => {
		const context = tokenizer.context;
		context.pending_expression += text;
	},

};


export function parse_template(source_code, ruleset, template_scope={}) {
	const tokenizer = new Advanced_Regex_Tokenizer(
		/* name */				'tokenizer',
		/* rules */				macro_pattern_factories[ruleset](),
		/* default_rule */		new Default_Macro_Pattern('text'),
		/* context */			{
			template_scope,
			pending_expression: '',
		},
	);
	//console.log(tokenizer.rules);

	for (const token of tokenizer.feed(source_code)) {
		const formatter = rule_formatters[token.rule.name]

		if (!formatter) {
			throw `No formatter for ${JSON.stringify(token.rule.name)}`;
		}
		formatter(tokenizer, ...token.value);
	}

	return tokenizer.context.pending_expression;
}

