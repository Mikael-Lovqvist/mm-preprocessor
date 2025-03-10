console.log(emit);

emit.stack = [];


emit.push = function emit_push() {
	emit.stack.push(context.pending_output);
	context.pending_output = '';
}

emit.pop = function emit_pop() {
	const result = context.pending_output;
	context.pending_output = emit.stack.pop();
	return result;
}
