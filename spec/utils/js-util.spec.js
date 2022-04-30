import {buildUrl,decodeQueryString} from "../../src/utils/js-util.js";

describe("js-util",()=>{
	it("can buildUrl",()=>{
		let o=decodeQueryString("a=5&b=3")
		//console.log(o);

		let u="/hello?b=2&a=1";
		//console.log(buildUrl(u,{a: 5, c:3}));
		//console.log(buildUrl(u,{b: undefined}));
	});
});