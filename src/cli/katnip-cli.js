#!/usr/bin/env node
"use strict";

import "dotenv/config";
import CommandRunner from "../../src/utils/CommandRunner.js";
import {create} from "./katnip-cli-create.js";
import {start, worker} from "./katnip-cli-start.js";

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

	if (runner.haveRunnableCommand()) {
		//console.log(runner.getCommand().getNamedArguments())
		//process.exit();
		await runner.run();
	}

	/*else {
		let katnip=await import(process.cwd()+"/node_modules/katnip/src/main/katnip-main-exports.js");
		await katnip.runCommand(runner);
	}*/

	else {
		await runner.run()
	}
}

main();