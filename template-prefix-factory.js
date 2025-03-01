import { Regex_Rule } from "./regex-matcher.js";

const factory_settings_by_name = {
	// output_mode
	output: {
		input_filter: (settings, text) => text,
	},
	eval: {
		input_filter: (settings, text) => JSON.stringify(text),
	},


	// variant
	comment: {
		output_formatter: (settings, text) => `_+=${JSON.stringify(settings.comment_formatter(settings, text))};`,
	},

	serialized_code: {
		output_formatter: (settings, text) => `_+='JSON.stringify('; _+=${text}; _+=')';`,
	},

	literal: {
		output_formatter: (settings, text) => `_+=JSON.stringify(${text});`,
	},

	code: {
		output_formatter: (settings, text) => `_+=${text};`,
	},

	macro: {
		output_formatter: (settings, text) => text,
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
	[/\/\/\s*/,		/(.*)/y,	'single'],
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

		Object.assign(factory_settings, factory_settings_by_name[output_mode_name]);
		Object.assign(factory_settings, factory_settings_by_name[variant_name]);
		Object.assign(factory_settings, factory_settings_by_name[comment_name]);

		if (count_capture_groups(pattern) != 1) {
			throw `Expected exactly one capture group for expression "${output_mode_name}-${variant_name}-${comment_name}" (${pattern})`;
		}

		yield new Regex_Rule(pattern, (matcher, text) => {
			//console.log(`MATCH FOR "${output_mode_name}-${variant_name}-${comment_name}" (${pattern}):`, JSON.stringify(text));
			const prepared_text = factory_settings.input_filter(factory_settings, text);
			const formatted_text = factory_settings.output_formatter(factory_settings, prepared_text);
			matcher.context.pending_expression += formatted_text;
			return true;
		})

	  }
	 }
	}
}


