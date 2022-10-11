#!/usr/bin/env node

import WebProcessParent from "../../src/cli/WebProcessParent.js";

function getParentInfo() {
	console.log("returning from parent");
	return "info from parent";
}

let parent=new WebProcessParent({
	modulePath: "spec/lab/pm-child.js",
	port: 8080,
	expose: {getParentInfo}
});

parent.start();