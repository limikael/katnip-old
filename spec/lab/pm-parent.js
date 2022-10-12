#!/usr/bin/env node

import WebProcessParent from "../../src/cli/WebProcessParent.js";
import {delay} from "../../src/utils/js-util.js";

console.log("Parent: "+process.pid);

let parent=new WebProcessParent({
	modulePath: "spec/lab/pm-child.js",
	port: 8080,
});

parent.start();

/*await delay(1000);

console.log("restarting");
await parent.start();*/

process.on("SIGUSR2",()=>{
	console.log("******");
	parent.start();
});