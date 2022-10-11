#!/usr/bin/env node

import WebProcessParent from "../../src/cli/WebProcessParent.js";
import {delay} from "../../src/utils/js-util.js";

console.log("Parent: "+process.pid);

let parent=new WebProcessParent({
	modulePath: "spec/lab/pm-child.js",
	port: 8080,
});

parent.start();

await delay(5000);

console.log("taking back control");
parent.stop();

//process.on("SIGUSR2",()=>{
//	parent.stop();
//});