export function run_in_scope(expression, scope={}) {
	return new Function(...Object.keys(scope), expression)(...Object.values(scope));
}
