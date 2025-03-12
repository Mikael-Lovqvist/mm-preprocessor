import { Advanced_Regex_Tokenizer, Regex_Rule } from "./regex-matcher.js";
import { run_in_scope } from "./function-utils.js";

import * as fs from "fs";

export class Macro_Pattern {
	constructor(name, pattern, format_lambda) {
		Object.assign(this, {name, pattern, format_lambda});
	}
}

export class Default_Macro_Pattern {
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

	gen_dollar: () => [
		new Macro_Pattern('generic-dollar', /\$\$\s*(.*?)\s*\$\$/s, 	(text) => `$$${text}$$`),
	],

	php_style: () => [
		new Macro_Pattern('php-long', /<\?php\s*(.*?)\s*\?>/s, 	(text) => `<?php${text}?>`),
		new Macro_Pattern('php-short-echo', /<\?=\s*(.*?)\s*\?>/s, 	(text) => `<?=${text}?>`),
		new Macro_Pattern('php-short', /<\?\s*(.*?)\s*\?>/s, 	(text) => `<?${text}?>`),
	],

	driveworks_html_template: () => [
		new Macro_Pattern('dw-html-template-expr', /<<\s*(.*?)\s*>>/s, 	(text) => `<<${text}>>`),
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

		const context = scope.context;
		scope.template = this;
		let expression = this.expression;

		for (const spf of context.script_pre_processors) {
			expression = spf(expression);
		}

		return run_in_scope(expression, scope);
	}

}

export function load_template_from_file(filename, ruleset_factory, encoding='utf8', template_scope={}) {
	const source = fs.readFileSync(filename, encoding);
	const template = new Template(null, {filename, encoding});
	template.expression = parse_template(source, ruleset_factory, {
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

	'generic-dollar': (tokenizer, text) => {
		const context = tokenizer.context;
		context.pending_expression += text;
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


export function parse_template(source_code, ruleset_factory, template_scope={}) {
	const context = {
		template_scope,
		pending_expression: '',
	};
	const tokenizer = new Advanced_Regex_Tokenizer(
		/* name */				'tokenizer',
		/* rules */				ruleset_factory(),
		/* default_rule */		new Default_Macro_Pattern('text'),
		/* context */			context,
	);

	for (const token of tokenizer.feed(source_code)) {
		const formatter = rule_formatters[token.rule.name]

		if (!formatter) {
			throw `No formatter for ${JSON.stringify(token.rule.name)}`;
		}
		formatter(tokenizer, ...token.value);
	}

	return tokenizer.context.pending_expression;
}

