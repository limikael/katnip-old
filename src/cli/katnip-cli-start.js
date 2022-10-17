import WebProcessParent from "../../src/webprocess/WebProcessParent.js";
import WebProcessChild from "../../src/webprocess/WebProcessChild.js";
import chokidar from "chokidar";
import open from "open";
import {getKatnipDir} from "../main/katnip-main-util.js";

export async function start(options) {
	console.log(options);

	if (!getKatnipDir()) {
		console.log("Not inside a project dir!");
		process.exit();
	}

	if (options.spawn) {
		let parent=new WebProcessParent({
			modulePath: process.cwd()+"/node_modules/katnip/src/cli/katnip-cli.js",
			args: ["worker", ...process.argv.slice(3)],
			port: options.port,
		});

		if (options.open)
			open("http://localhost:"+options.port);

		parent.start();

		if (options.watch) {
			let watcher=chokidar.watch(process.cwd(),{
				ignored: [
					"**/node_modules/**", "**/.git/**", "**/*.db*",
					"**/.env", "**/package.json", "**/package-lock.json", "**/yarn.lock"
				],
				persistent: true
			});

			watcher.on("ready",(ev, p)=>{
				console.log("Watching...");
				watcher.on("all",(ev, p)=>{
					parent.start();
					console.log(ev+" "+p);
				});
			});
		}

		process.on("SIGUSR2",()=>{
			console.log("*******");
			parent.start();
		});
	}

	else {
		let katnip=await import(process.cwd()+"/node_modules/katnip/src/main/katnip-main-exports.js")
		await katnip.run(options);

		if (options.open)
			open("http://localhost:"+options.port);
	}
}

start.desc="Start server.";
start.args={
	port: {
		desc: "Port to listen to.",
		env: "PORT",
		default: 3000
	},
	"spawn": {
		desc: "Spawn child process.",
		type: "boolean",
		default: true
	},
	"watch": {
		desc: "Watch files for changes. Requires a spawned child process.",
		type: "boolean",
		default: true
	},
	"minify": {
		desc: "Minify client bundle.",
		type: "boolean",
		default: true
	},
	"open": {
		desc: "Open browser.",
		type: "boolean",
		default: true
	}
};

export async function worker(options) {
	options.webProcessChild=new WebProcessChild();
	let katnip=await import(process.cwd()+"/node_modules/katnip/src/main/katnip-main-exports.js")
	await katnip.run(options);
}

worker.undoc=true;
worker.args=start.args;
