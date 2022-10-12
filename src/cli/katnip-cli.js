#!/usr/bin/env node
"use strict";

import "dotenv/config";
import minimist from "minimist";
import KatnipScaffolder from "./KatnipScaffolder.js";
import WebProcessParent from "../../src/webprocess/WebProcessParent.js";
import WebProcessChild from "../../src/webprocess/WebProcessChild.js";
import chokidar from "chokidar";

function usage() {
	console.log("Usage: katnip [options] <command>");
	console.log("");
	console.log("Commands:");
	console.log("  dev      - Start server in development mode.");
	console.log("  start    - Start server in production mode.");
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

if (!options.port)
	options.port=3000;

Object.assign(options,minimist(process.argv.slice(2)));

switch (options._[0]) {
	case "create":
		let scaffolder=new KatnipScaffolder(options);
		scaffolder.run();
		break;

	case "start":
		let parent=new WebProcessParent({
			modulePath: process.cwd()+"/node_modules/katnip/src/cli/katnip-cli.js",
			args: ["worker"],
			port: options.port,
		});

		parent.start();

		let watcher=chokidar.watch(process.cwd(),{
			ignored: ["**/node_modules/**","**/.git/**","**/*.db*"],
			persistent: true
		});

		watcher.on("ready",(ev, p)=>{
			console.log("Watching...");
			watcher.on("all",(ev, p)=>{
				parent.start();
				console.log(ev+" "+p);
			});
		});

		process.on("SIGUSR2",()=>{
			console.log("*******");
			parent.start();
		});
		break;

	case "worker":
		options.webProcessChild=new WebProcessChild();
		let katnip=await import(process.cwd()+"/node_modules/katnip/src/main/katnip-main-exports.js")

		katnip.run(options);

		console.log("hello i'm the worker...")
		break;

	default:
		usage();
		break;
}

