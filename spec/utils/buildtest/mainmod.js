import {common, shakeMe} from "./common.js";

export class Hello {
	hello() {
		console.log("blabla"+common()+shakeMe());
	}
}