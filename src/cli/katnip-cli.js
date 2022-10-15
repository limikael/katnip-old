#!/usr/bin/env node
"use strict";

import "dotenv/config";
import CommandRunner from "../../src/utils/CommandRunner.js";
import {create} from "./katnip-cli-create.js";
import {start, worker} from "./katnip-cli-start.js";

async function main() {
	let runner=new CommandRunner("katnip",{
		args: {
			dsn: {
				env: "DSN",
				shortdesc: "Specify data service name."
			}
		}
	});

	runner.addCommand("create",create);
	runner.addCommand("start",start);
	runner.addCommand("worker",worker);

	if (runner.haveCommand()) {
		await runner.run();
	}

	else {
		let katnip=await import(process.cwd()+"/node_modules/katnip/src/main/katnip-main-exports.js");
		await katnip.runCommand(runner);
	}
}

main();