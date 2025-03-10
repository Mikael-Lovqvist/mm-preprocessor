import { context } from "mm_preprocess/context.js";
import { Default_Macro_Pattern, Macro_Pattern } from "mm_preprocess/template.js";
import { Advanced_Regex_Tokenizer } from "mm_preprocess/regex-matcher.js";

export function stuff() {
	console.log("Stuff!");
}

context.classification = {
	check: function check_classification(element, collection) {
	},
};

class Classification_Transform {
	constructor(pattern, handler) {
		Object.assign(this, {pattern, handler});
	}

	fetch(...args) {
		return this.handler(...args);
	}

}

class Default_Transform {
	static fetch(text) {
		return text;
	}
}

const tokenizer = new Advanced_Regex_Tokenizer(
	'classification-tokenizer', [
		new Classification_Transform(/\(\s*(.*?)\s*∈\s*(.*?)\s*\)/, (element, collection) => {
			console.log(`We should check if "${element}" or "${collection}" are special before falling back to runtime expression.`);
			return `(context.classification.check(${element}, ${collection}))`;
		}),
	], Default_Transform
);


context.script_pre_processors.push(function(script) {



	let result = '';
	//console.log("START PREPROC!");
	for (const token of tokenizer.feed(script)) {
		result += token.rule.fetch(...token.value);
	}
	//console.log("END PREPROC!");
	//console.log(result);
	return result;
});
