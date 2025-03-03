import { inspect } from 'util';

//TODO - sunset this one?
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
			if (rule_match) {
				this.state.match = rule_match;
				return rule_match;
			}
		}
	}

};


export class Regex_Tokenizer {
	constructor(name, rules=[], context={}, state={}) {
		this.name = name;
		this.rules = rules;
		this.context = context;
		this.state = state;
	}


	match_pending_token(text, position=0) {
		this.state.position = position;
		for (const rule of this.rules) {
			this.state.rule = rule;
			rule.pattern.lastIndex = position;	//CODESMELL - our tokenizer updates the pattern here, it may have been better to have specific tokenization regex rules but we will do it like this for now.
			const rule_match = rule.match(this, text);
			if (rule_match) {
				this.state.match = rule_match;
				return rule_match;
			}
		}
	}

	feed(text) {

		let position = 0;
		while (true) {
			const match = this.match_pending_token(text, position);
			if (!match) {
				return;
			}
			position += this.state.re_match[0].length;
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
			if (sub_match) {
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

	get pending_index() {
		return this.match.index + this.match[0].length;
	}

};


export class Default_Match {
	constructor(value, index, end_index, rule, type=null) {
		this.value = value;
		this.index = index;
		this.end_index = end_index;
		this.rule = rule;
		this.type = type;
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


