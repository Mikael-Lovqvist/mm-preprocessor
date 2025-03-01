import { Regex_Rule, Regex_Tokenizer } from "./regex-matcher.js";

import * as fs from "fs";
import * as esprima from "esprima";

const comment_tokenizer = new Regex_Tokenizer('comment_tokenizer', [
	//TODO - maybe build these by factory to prevent a lot of drysoot (DRY/SSoT)

	// Evaluate and output as code
	new Regex_Rule(	/\/\/\s*%%=(.*)/y,	(matcher, code) => {
		matcher.context.pending_expression += `_+=${code};`;
		return true;
	}),

	new Regex_Rule(	/\/\*\s*%%=(.*)\*\//sy,	(matcher, code) => {
		matcher.context.pending_expression += `_+=${code};`;
		return true;
	}),

	// Output as comment
	new Regex_Rule(	/\/\/\s*%%\/\/(.*)/y,	(matcher, comment) => {
		const code = `//${comment}`;
		matcher.context.pending_expression += `_+=${JSON.stringify(code)};`;
		return true;
	}),

	new Regex_Rule(	/\/\*\s*%%\/\/(.*)\*\//sy,	(matcher, comment) => {
		const code = `/*${comment}*/`;
		matcher.context.pending_expression += `_+=${JSON.stringify(code)};`;
		return true;
	}),


	// Output as code
	new Regex_Rule(	/\/\/\s*%%(.*)/y,	(matcher, comment) => {
		matcher.context.pending_expression += comment;
		return true;
	}),

	new Regex_Rule(	/\/\*\s*%%(.*)\*\//sy,	(matcher, comment) => {
		matcher.context.pending_expression += comment;
		return true;
	}),

	// Whitespace is output as is
	new Regex_Rule(	/\s+/y,	(matcher) => {
		matcher.context.pending_expression += `_+=${JSON.stringify(matcher.state.re_match[0])};`;
		return true;
	}),

]);

export class Template {
	constructor(expression, info) {
		this.expression = expression;
		Object.assign(this, info);
	}

	execute(scope) {
		return new Function(...Object.keys(scope), this.expression)(...Object.values(scope));
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

		comment_tokenizer.feed(head);
		comment_tokenizer.context.pending_expression += `_+=${JSON.stringify(source_code.slice(left, right))};`;	//Add code
	}

	return `let _='';${comment_tokenizer.context.pending_expression}return _;`;
}

