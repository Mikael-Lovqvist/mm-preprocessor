import { Run_Tests } from "./testing-framework.js";

import { test_list as basic_features } from "./test-basic-features.js";
import { test_list as eval_def } from "./test-eval-def.js";
import { test_list as preexec } from "./test-preexec.js";



Run_Tests([
	...basic_features,
	...eval_def,
	...preexec,
]);