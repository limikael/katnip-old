import {pathMatch} from "../../src/utils/path-match.js";

describe("path-match",()=>{
	it("matches paths",()=>{
		expect(pathMatch("admin/**","/admin")).toEqual("ac");
		expect(pathMatch("hello/world","/hello/world")).toEqual("aa");
	});
});