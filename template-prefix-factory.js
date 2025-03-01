import { Regex_Rule } from "./regex-matcher.js";
import { run_in_scope } from "./function-utils.js";
import { inspect } from 'util';

const factory_settings_by_name = {
	// output_mode
	output: {
		main_formatter: (settings, text) => text,
	},
	eval: {
		main_formatter: (settings, text) => run_in_scope(`return ${text};`, settings.template_scope),
	},


	// variant
	comment: {
		output_formatter: (settings, text) => `_+=${JSON.stringify(settings.comment_formatter(settings, settings.main_formatter(settings, text)))};`,
	},

	debug_comment: {
		output_formatter: (settings, text) => `_+=${JSON.stringify(settings.comment_formatter(settings, inspect(settings.main_formatter(settings, text), { depth: null, colors: false })))};`,
	},

	serialized_code: {
		output_formatter: (settings, text) => `_+='JSON.stringify('; _+=${settings.main_formatter(settings, text)}; _+=')';`,
	},

	literal: {
		output_formatter: (settings, text) => `_+=JSON.stringify(${settings.main_formatter(settings, text)});`,
	},

	code: {
		output_formatter: (settings, text) => `_+=${settings.main_formatter(settings, text)};`,
	},

	macro: {
		output_formatter: (settings, text) => settings.main_formatter(settings, text),
	},


	// comment style
	single: {
		comment_formatter: (settings, text) => `// ${text}`,
	},

	multi: {
		comment_formatter: (settings, text) => `/* ${text} */`,
	},

};

export const output_mode_table = [
	[/%/,				'output'],		//	%
	[/@/,				'eval'],		// 	@
]

export const variant_table = [
	[/\s*debug comment/,		'debug_comment'],		//	% debug comment
	[/\s*dbg/,					'debug_comment'],		//	% dbg
	[/\/[dD]/,					'debug_comment'],		//	%/D

	[/\s*comment/,				'comment'],				//	% comment
	[/\s*com/,					'comment'],				//	% com
	[/\//,						'comment'],				//	%/

	[/\s*serialized\s+code/,	'serialized_code'],		//	% serialized code
	[/\s*ser-code/,				'serialized_code'],		//	% ser-code
	[/[sS]=/,					'serialized_code'],		//	%s=

	[/\s*literal/,				'literal'],				//	% literal
	[/\s*lit/,					'literal'],				//	% lit
	[/#/,						'literal'],				//	%#

	[/\s*code/,					'code'],				//	% code
	[/=/,						'code'],				//	%=

	[/\s*macro/,				'macro'],				//	% macro
	[/%/,						'macro'],				//	%%
]


export const comment_pattern_table = [
	[/\/\/\s*/,		/(.*)/y,		'single'],
	[/\/\*\s*/, 	/(.*?)\*\//sy,	'multi'],
]


function count_capture_groups(pattern) {
	return new RegExp(`$(pattern.source)|`).exec().length - 1;
}

function concat_regular_expressions(...pattern_list) {
	let pending_source = '';
	const pending_flags = new Set();

	for (const pattern of pattern_list) {
		pending_source += pattern.source;
		for (const flag of pattern.flags) {
			pending_flags.add(flag);
		}
	}

	return new RegExp(pending_source, String.prototype.concat(...pending_flags));
}

export function *create_prefix_rules() {

	for (const [output_mode_pattern, output_mode_name] of output_mode_table) {
	 for (const [variant_pattern, variant_name] of variant_table) {
	  for (const [comment_pattern_prefix, comment_pattern_suffix, comment_name] of comment_pattern_table) {
		const pattern = concat_regular_expressions(comment_pattern_prefix, output_mode_pattern, variant_pattern, comment_pattern_suffix);

		const factory_settings = {};

		Object.assign(factory_settings, factory_settings_by_name[comment_name]);
		Object.assign(factory_settings, factory_settings_by_name[variant_name]);
		Object.assign(factory_settings, factory_settings_by_name[output_mode_name]);

		if (count_capture_groups(pattern) != 1) {
			throw `Expected exactly one capture group for expression "${output_mode_name}-${variant_name}-${comment_name}" (${pattern})`;
		}

		yield new Regex_Rule(pattern, (matcher, text) => {
			//console.log(`MATCH FOR "${output_mode_name}-${variant_name}-${comment_name}" (${pattern}):`, JSON.stringify(text));
			//const prepared_text = factory_settings.input_filter(factory_settings, text);
			factory_settings.template_scope = matcher.context.template_scope;

			const formatted_text = factory_settings.output_formatter(factory_settings, text);
			matcher.context.pending_expression += formatted_text;
			return true;
		})

	  }
	 }
	}
}


