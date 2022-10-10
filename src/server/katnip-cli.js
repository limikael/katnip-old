#!/usr/bin/env node
"use strict";

import "dotenv/config";
import minimist from "minimist";
import KatnipServer from "./KatnipServer.js";
import KatnipScaffolder from "../scaffolder/KatnipScaffolder.js";

function usage() {
	console.log("Usage: katnip [options] <command>");
	console.log("");
	console.log("Commands:");
	console.log("  dev      - Start server in development mode.");
	console.log("  start    - Start server in production mode.");
	console.log("  create   - Interactively create a new project.");
	console.log("");
	console.log("Options:");
	console.log("  --dsn=   - Data service name.");
	console.log("  --port=  - Port to listen to.");
	console.log("");

	process.exit(1);
}

let envOpts={
	"DSN": "dsn",
	"PORT": "port"
};

let options={};
for (let opt in envOpts)
	if (process.env[opt])
		options[envOpts[opt]]=process.env[opt];

Object.assign(options,minimist(process.argv.slice(2)));

switch (options._[0]) {
	case "create":
		let scaffolder=new KatnipScaffolder(options);
		scaffolder.run();
		break;

	case "dev":
	case "start":
		let katnip=await import(process.cwd()+"/node_modules/katnip/src/main/katnip-main-exports.js")
		await katnip.run(options);

		/*let server=new KatnipServer(options);
		server.run();*/
		break;

	default:
		usage();
		break;
}

