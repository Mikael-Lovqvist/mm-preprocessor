import { Regex_Tokenizer, Regex_Rule } from "./regex-matcher.js";
import { create_prefix_rules } from "./template-prefix-factory.js";

import * as fs from "fs";
import * as esprima from "esprima";

const comment_tokenizer = new Regex_Tokenizer('comment_tokenizer', [

	...create_prefix_rules(),

	new Regex_Rule(	/\s+/y,	(matcher) => {
		matcher.context.pending_expression += `_+=${JSON.stringify(matcher.state.re_match[0])};`;
		return true;
	}),

]);


export function run_in_scope(expression, scope={}) {
	return new Function(...Object.keys(scope), expression)(...Object.values(scope));
}

export class Template {
	constructor(expression, info) {
		this.expression = expression;
		Object.assign(this, info);
	}

	execute(scope, install_emit_utils_as) {

		if (install_emit_utils_as) {
			scope[install_emit_utils_as] = new emit_utils();
		}

/*		console.log('-- TEMPLATE BEGIN --');
		console.log(this.expression);
		console.log('-- TEMPLATE END --');*/
		return run_in_scope(this.expression, scope);
	}

}

export function load_template_from_file(filename, encoding='utf8') {
	const source = fs.readFileSync(filename, encoding);
	return new Template(parse_template(source), {filename, encoding});
}


export function parse_template(source_code) {
	comment_tokenizer.context.pending_expression = '';

	let previous = 0;
	for (const token of esprima.tokenize(source_code, {range: true})) {
		const [left, right] = token.range;
		const head = source_code.slice(previous, left);
		previous = right;

		//console.log('HEAD', JSON.stringify(head));
		comment_tokenizer.feed(head);
		comment_tokenizer.context.pending_expression += `_+=${JSON.stringify(source_code.slice(left, right))};`;	//Add code
	}

	const tail = source_code.slice(previous);
	comment_tokenizer.feed(tail);

	return `let _='';${comment_tokenizer.context.pending_expression}return _;`;
}

