import { context } from "mm_preprocess/context.js";
export function debug_dump() {
	console.log(context.scope.template.expression);
}
