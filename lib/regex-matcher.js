import { inspect } from 'util';

export function concat_regular_expressions(...pattern_list) {
	let pending_source = '';
	const pending_flags = new Set();

	for (const pattern of pattern_list) {

		if (pattern instanceof RegExp) {
			pending_source += pattern.source;
			for (const flag of pattern.flags) {
				pending_flags.add(flag);
			}
		} else {
			pending_source += pattern;
		}
	}

	return new RegExp(pending_source, String.prototype.concat(...pending_flags));
}

export class Regex_Matcher {
	constructor(name, rules=[], context={}, state={}) {
		this.name = name;
		this.rules = rules;
		this.context = context;
		this.state = state;
	}


	match(value) {
		this.state.value = value;
		for (const rule of this.rules) {
			this.state.rule = rule;
			const rule_match = rule.match(this, value);
			if (rule_match !== undefined) {
				this.state.match = rule_match;
				return rule_match;
			}
		}
	}

};



export class Regex_Rule {
	constructor(pattern, handler) {
		this.pattern = pattern;
		this.handler = handler;
	}

	match(matcher, value) {
		const re_match = value.match(this.pattern);
		if (re_match) {
			matcher.state.re_match = re_match;
			const sub_match = this.handler(matcher, ...re_match.slice(1));
			if (sub_match !== undefined) {
				return sub_match;
			}
		}
	}

};





export class Pattern_Match {
	constructor(match, rule, type=null) {
		this.match = match;
		this.rule = rule;
		this.type = type;
	}

	get value() {
		return this.match.slice(1);
	}

	get pending_index() {
		return this.match.index + this.match[0].length;
	}

};


export class Default_Match {
	constructor(text, index, end_index, rule, type=null) {
		this.text = text;
		this.index = index;
		this.end_index = end_index;
		this.rule = rule;
		this.type = type;
	}

	get value() {
		return [this.text];
	}

	get pending_index() {
		if (this.end_index === null) {
			return null;
		} else {
			return this.end_index;
		}
	}

};





export class Advanced_Regex_Tokenizer {
	constructor(name, rules=[], default_rule, context={}, state={}) {
		this.name = name;
		this.rules = rules;
		this.default_rule = default_rule;
		this.context = context;
		this.state = state;
	}


	*feed(text, position=0) {

		while (true) {
			const new_chunk = [...this.find_matches(text, position)];

			if (new_chunk.length) {
				position = new_chunk.at(-1).pending_index;
				yield* new_chunk;
			} else {
				position = null;
			}

			if (position === null) {
				return;
			}
		}

	}

	_handle_default_match(value, index, end_index=null) {
		const default_rule = this.default_rule;
		if (!default_rule) {
			throw `Parsing failed, no match for ${JSON.stringify(value)} (${inspect(this, { depth: null, colors: true })})` ; //TODO actual exception object
		}
		return new Default_Match(value, index, end_index, default_rule);
	}

	*find_matches(text, position=0) {
		// First pass - immediate matches
		for (const rule of this.rules) {

			const pattern = new RegExp(rule.pattern.source, rule.pattern.flags + 'y');
			pattern.lastIndex = position;
			const match = pattern.exec(text);
			if (match) {
				yield new Pattern_Match(match, rule);
				return;
			}

		}

		// Second pass - global matches
		let best_match;
		for (const rule of this.rules) {
			const pattern = new RegExp(rule.pattern.source, rule.pattern.flags + 'g');
			pattern.lastIndex = position;
			const match = pattern.exec(text);

			if (match) {
				if ((best_match === undefined) || (best_match.match.index > match.index)) {
					best_match = new Pattern_Match(match, rule);
				}
			}
		}

		// There was no match, just get the tail
		if (!best_match) {
			const tail = text.slice(position);
			if (tail.length) {
				yield this._handle_default_match(tail, position);
			}
			return;
		}

		// There was a match, check the head
		const head = text.slice(position, best_match.match.index);
		if (head.length) {
			yield this._handle_default_match(head, position, best_match.match.index);
		}

		yield best_match;

	}

};


