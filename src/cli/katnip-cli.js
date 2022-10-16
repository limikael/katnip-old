#!/usr/bin/env node
"use strict";

import "dotenv/config";
import CommandRunner from "../../src/utils/CommandRunner.js";
import {create} from "./katnip-cli-create.js";
import {start, worker} from "./katnip-cli-start.js";
import {getKatnipDir} from "../main/katnip-main-util.js";
import fs from "fs";
import path from "path";

async function main() {
	let runner=new CommandRunner("katnip",{
		desc: "Herding cats since 2022.",
		args: {
			dsn: {desc: "Specify data service name.", env: "DSN"},
			version: {desc: "Print version and exit.", type: "boolean"},
			"dep-version": {desc: "Print version of the katnip dependency of the project.", type: "boolean"}
		}
	});

	runner.setCommandLine(process.argv.slice(2));

	if (runner.getNamedArguments().version) {
		let dir=path.dirname(new URL(import.meta.url).pathname);
		let pkg=JSON.parse(fs.readFileSync(dir+"/../../package.json"));
		console.log("Katnip CLI, version: "+pkg.version);
		process.exit();
	}

	runner.addCommand("create",create);
	runner.addCommand("start",start);
	runner.addCommand("worker",worker);

	let projectDir=getKatnipDir(process.cwd());
	if (projectDir)
		runner.addNotes("Project directory: "+process.cwd());

	else
		runner.addNotes("No project directory detected, functionality is limited.");

	if (runner.haveRunnableCommand()) {
		await runner.run();
	}

	else if (getKatnipDir()) {
		if (runner.getNamedArguments()["dep-version"]) {
			let pkg=JSON.parse(fs.readFileSync(process.cwd()+"/node_modules/katnip/package.json"));
			console.log("Katnip NPM module, version: "+pkg.version);
			process.exit();
		}

		let katnip=await import(process.cwd()+"/node_modules/katnip/src/main/katnip-main-exports.js");
		await katnip.runCommand(runner);
	}

	else {
		if (runner.getNamedArguments()["dep-version"]) {
			console.log("No project directory detected.");
			process.exit();
		}

		await runner.run()
	}
}

main();