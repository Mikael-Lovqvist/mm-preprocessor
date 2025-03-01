
export const prefix_table = [
	[/%/,				'output'],		//	%
	[/@/,				'eval'],		// 	@
]

export const variant_table = [
	[/\s*comment/,		'comment'],		//	%comment
	[/\s*com/,			'comment'],		//	%com
	[/\//,				'comment'],		//	%#

	[/\s*literal/,		'literal'],		//	%literal
	[/\s*lit/,			'literal'],		//	%lit
	[/=/,				'literal'],		//	%=

	[/\s*code/,			'code'],		//	%code
	[/%/,				'code'],		//	%%
]


export const comment_pattern_table = [
	[/\/\/\s*/,		/(.*)/y,	'single'],
	[/\/\*\s*/, 	/(.*?)/sy,	'multi'],
]


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

export function create_prefix_rules() {

	for (const [prefix_pattern, prefix_name] of prefix_table) {
	 for (const [variant_pattern, variant_name] of variant_table) {
	  for (const [comment_pattern_prefix, comment_pattern_suffix, comment_name] of comment_pattern_table) {
		const pattern = concat_regular_expressions(comment_pattern_prefix, prefix_pattern, variant_pattern, comment_pattern_suffix);
		console.log(prefix_name, variant_name, comment_name, pattern);
	  }
	 }
	}
}


/* OUTPUT

output comment single /\/\/\s*%\s*comment(.*)/y
output comment multi /\/\*\s*%\s*comment(.*?)/sy
output comment single /\/\/\s*%\s*com(.*)/y
output comment multi /\/\*\s*%\s*com(.*?)/sy
output comment single /\/\/\s*%\/(.*)/y
output comment multi /\/\*\s*%\/(.*?)/sy
output literal single /\/\/\s*%\s*literal(.*)/y
output literal multi /\/\*\s*%\s*literal(.*?)/sy
output literal single /\/\/\s*%\s*lit(.*)/y
output literal multi /\/\*\s*%\s*lit(.*?)/sy
output literal single /\/\/\s*%=(.*)/y
output literal multi /\/\*\s*%=(.*?)/sy
output code single /\/\/\s*%\s*code(.*)/y
output code multi /\/\*\s*%\s*code(.*?)/sy
output code single /\/\/\s*%%(.*)/y
output code multi /\/\*\s*%%(.*?)/sy
eval comment single /\/\/\s*@\s*comment(.*)/y
eval comment multi /\/\*\s*@\s*comment(.*?)/sy
eval comment single /\/\/\s*@\s*com(.*)/y
eval comment multi /\/\*\s*@\s*com(.*?)/sy
eval comment single /\/\/\s*@\/(.*)/y
eval comment multi /\/\*\s*@\/(.*?)/sy
eval literal single /\/\/\s*@\s*literal(.*)/y
eval literal multi /\/\*\s*@\s*literal(.*?)/sy
eval literal single /\/\/\s*@\s*lit(.*)/y
eval literal multi /\/\*\s*@\s*lit(.*?)/sy
eval literal single /\/\/\s*@=(.*)/y
eval literal multi /\/\*\s*@=(.*?)/sy
eval code single /\/\/\s*@\s*code(.*)/y
eval code multi /\/\*\s*@\s*code(.*?)/sy
eval code single /\/\/\s*@%(.*)/y
eval code multi /\/\*\s*@%(.*?)/sy

*/