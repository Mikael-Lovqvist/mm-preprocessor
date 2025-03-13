


export class Configuration_Schema {
	constructor(name, children={}) {
		Object.assign(this, { name, children });
	}

	instance(target={}) {
		for (const [name, child] of Object.entries(this.children)) {
			target[name] = child.instance();
		}
		return target;
	}

	*walk(...targets) {
		const generators = targets.map((target) => this.walk_single(target));

		while (true) {

			const result = [];
			for (const gen of generators) {
				const pending = gen.next();
				if (pending.value !== undefined) {
					result.push(pending.value);
				}
				if (pending.done) {
					break;
				}
			}

			if (result.length == 0) {
				break;
			} else if (result.length == targets.length) {
				yield result;
			} else {
				throw "Assymetrical generators";
			}
		}

	}

	*walk_single(target={}) {
		for (const [key, setting] of Object.entries(this.children)) {
			if (setting instanceof Configuration_Schema) {
				yield* setting.walk_single(target[key]);
			} else if (setting instanceof Abstract_Value) {
				yield [target, key, setting, target[key]];
			} else {
				throw `Unhandled setting: ${key} of ${target} is ${setting}`;
			}
		}
	}

	merge(target, ...secondary) {

		for (const [target_data, ...secondary_data_list] of this.walk(target, ...secondary)) {
			const [target_target, target_key, target_setting, target_value] = target_data;
			if (target_value !== undefined) {
				// No action, target already have the value
			} else {
				// Use first secondary value we encounter
				for (const [secondary_target, secondary_key, secondary_setting, secondary_value] of secondary_data_list) {
					if (secondary_value !== undefined) {
						target_target[target_key] = secondary_value;
						break;
					}
				}

				if (target_target[target_key] === undefined) {
					// Not defined at all
					target_target[target_key] = target_setting.instance();
				}
			}
		}
	}
}


export class Abstract_Value {
	constructor(name, default_factory=null) {
		Object.assign(this, { name, default_factory: default_factory });
	}

	instance(...factory_arguments) {
		if (this.default_factory) {
			return this.default_factory(...factory_arguments);
		} else {
			if (factory_arguments.length) {
				throw `Arguments only permitted when a default_factory has been set`;
			}
			return undefined;
		}
	}

	load(value) {
		if (value === undefined) {
			return this.instance();
		} else {
			this.validate(value);
			return value;
		}
	}

	validate(value) {
	}

}

export class List_Value extends Abstract_Value {
	constructor(name, default_factory=Array) {
		super(name, default_factory);
	}


	validate(value) {
		//TODO - make sure is list or throw exception
	}

}

export class Primitive_Value extends Abstract_Value {
	constructor(name, default_value=null) {
		super(name, () => default_value);
	}

}

