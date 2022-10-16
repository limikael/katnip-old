#!/usr/bin/env node
"use strict";

import "dotenv/config";
import CommandRunner from "../../src/utils/CommandRunner.js";
import {create} from "./katnip-cli-create.js";
import {start, worker} from "./katnip-cli-start.js";
import {getKatnipDir} from "../main/katnip-main-util.js";
import fs from "fs";

async function main() {
	let runner=new CommandRunner("katnip",{
		desc: "Herding cats since 2022.",
		args: {
			dsn: {desc: "Specify data service name.", env: "DSN"}
		}
	});

	runner.setCommandLine(process.argv.slice(2));
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
		let katnip=await import(process.cwd()+"/node_modules/katnip/src/main/katnip-main-exports.js");
		await katnip.runCommand(runner);
	}

	else {
		await runner.run()
	}
}

main();