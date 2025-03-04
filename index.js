import { Regex_Matcher, Regex_Rule, concat_regular_expressions } from "./regex-matcher.js";
import { parse_arguments } from "./argument-parser.js";
import { load_template_from_file } from "./template.js";
import { run_in_scope } from "./function-utils.js";
import * as fs from "fs";



const template_functions = {
	emit: (context, text) => {
		context.pending_output += text;
	},
	emit_multiline_comment_end: (context) => {	//TODO - this should come from the style!
		context.pending_output += '*/';
	},
	emit_multiline_comment_start: (context) => {	//TODO - this should come from the style!
		context.pending_output += '/*';
	},
	emit_json: (context, text) => {
		context.pending_output += JSON.stringify(text);
	},
};


function *create_version_comparisons(auto_strip=false) {

	let ingress;
	let egress;

	if (auto_strip) {
		ingress = /^\D*(\d+)\.(\d+)\.(\d+)\D*/;
		egress =  /\D*(\d+)\.(\d+)\.(\d+)\D*$/;
	} else {
		ingress = /^(\d+)\.(\d+)\.(\d+)\s*/;
		egress =  /\s*(\d+)\.(\d+)\.(\d+)$/;
	}



	const comparison_table = [
		[/=/,	(maj1, min1, rev1, maj2, min2, rev2) => (rev1 == rev2 && min1 == min2 && maj1 == maj2)],
		[/==/,	(maj1, min1, rev1, maj2, min2, rev2) => (maj1 === maj2 && min1 === min2 && rev1 === rev2)],
		[/!=/,	(maj1, min1, rev1, maj2, min2, rev2) => (maj1 !== maj2 || min1 !== min2 || rev1 !== rev2)],
		[/>/,	(maj1, min1, rev1, maj2, min2, rev2) => (maj1 > maj2 || (maj1 === maj2 && min1 > min2) || (maj1 === maj2 && min1 === min2 && rev1 > rev2))],
		[/>=/,	(maj1, min1, rev1, maj2, min2, rev2) => (maj1 > maj2 || (maj1 === maj2 && min1 > min2) || (maj1 === maj2 && min1 === min2 && rev1 >= rev2))],
		[/</,	(maj1, min1, rev1, maj2, min2, rev2) => (maj1 < maj2 || (maj1 === maj2 && min1 < min2) || (maj1 === maj2 && min1 === min2 && rev1 < rev2))],
		[/<=/,	(maj1, min1, rev1, maj2, min2, rev2) => (maj1 < maj2 || (maj1 === maj2 && min1 < min2) || (maj1 === maj2 && min1 === min2 && rev1 <= rev2))]
	];

	for (const [op, func] of comparison_table) {
		yield new Regex_Rule(concat_regular_expressions(ingress, op, egress),
			(matcher, maj1, min1, rev1, maj2, min2, rev2) => {
				return func(+maj1, +min1, +rev1, +maj2, +min2, +rev2);
			}
		);
	}
}

const semantic_version_matcher = new Regex_Matcher(
	'semantic_version_matcher', [
		...create_version_comparisons(false),
		new Regex_Rule(/^\s*(\d+)\.(\d+)\.(\d+)\s*$/,	(matcher, major, minor, revision) => new Semantic_Version(+major, +minor, +revision)),
	],
);

const semantic_version_auto_strip_matcher = new Regex_Matcher(
	'semantic_version_auto_strip_matcher', [
		...create_version_comparisons(true),
		new Regex_Rule(/^\D*(\d+)\.(\d+)\.(\d+)\D*$/,	(matcher, major, minor, revision) => new Semantic_Version(+major, +minor, +revision)),
	],
);



class Semantic_Version {
	constructor(major, minor, revision) {
		Object.assign(this, {
			major, minor, revision
		});

	}

	static auto_strip = false;

	static from_string(string) {

		let matcher = semantic_version_matcher;
		if (this.auto_strip) {
			matcher = semantic_version_auto_strip_matcher;
		}

		const result = matcher.match(string);
		if (result === undefined) {
			throw `Wrong format for version: ${JSON.stringify(string)}`
		}

		return result;
	}

	toString() {
		return `${this.major}.${this.minor}.${this.revision}`;
	}

};

function bind_functions(context) {
	const result = {};

	result.discard = () => {};

	result.semver = (string) => Semantic_Version.from_string(string);	//TODO: Perhaps later from_expression
	result.semver.config = Semantic_Version;

	result.emit = (...text_pieces) => {
		template_functions.emit(context, text_pieces.join(' '));
	};

	result.emit.json = (text) => {
		template_functions.emit_json(context, text);
	};

	result.emit.line = (...text_pieces) => {
		template_functions.emit(context, text_pieces.join(' ') + '\n');
	};

	result.emit.block = (...lines) => {
		for (const line of lines) {
			template_functions.emit(context, line + '\n');
		}
	};

	result.emit.multiline_comment_start = () => {
		template_functions.emit_multiline_comment_start(context);
	};

	result.emit.multiline_comment_end = () => {
		template_functions.emit_multiline_comment_end(context);
	};

	result.emit.multiline_comment = (comment, padding='') => {
		template_functions.emit_multiline_comment_start(context);
		template_functions.emit(context, padding);
		template_functions.emit(context, comment);
		template_functions.emit(context, padding);
		template_functions.emit_multiline_comment_end(context);
	};

	result.log = (...msg) => {
		console.debug('TEMPLATE LOG:', ...msg);
	}

	return result;
}


export function main() {
	const arg_context = parse_arguments(process.argv.slice(2));

	const context = {
		arguments: arg_context,
		pending_output: '',
	};

	const template_scope = {
		D: arg_context.definitions,
	};

	Object.assign(template_scope, bind_functions(context));

	if (!arg_context.positionals.length) {
		arg_context.positionals.push('/dev/stdin');
	}

	for (const input_file of arg_context.positionals) {
		const template = load_template_from_file(input_file, arg_context.style, arg_context.encoding, template_scope);
		template.execute(template_scope);

	}

	fs.writeFileSync(arg_context.output_file, context.pending_output, {
		encoding: 'utf8',
	});

}

