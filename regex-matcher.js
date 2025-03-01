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

