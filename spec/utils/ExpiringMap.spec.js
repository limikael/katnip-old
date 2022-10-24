import ExpiringMap from "../../src/utils/ExpiringMap.js";
import {delay} from "../../src/utils/js-util.js";

describe("ExpiringMap",()=>{
	it("works",async ()=>{
		let m=new ExpiringMap(100);
		m.set("hello","world");
		expect(m.get("hello")).toEqual("world");
		await delay(300);
		expect(m.get("hello")).toBe(undefined);
	});
});