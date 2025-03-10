import { context } from "mm_preprocess/context.js";

const emit = context.scope.emit;


emit.loud = function emit_loud(line) {
	emit.line(line.toUpperCase());
}

