import WebProcessParent from "../../src/webprocess/WebProcessParent.js";
import WebProcessChild from "../../src/webprocess/WebProcessChild.js";
import chokidar from "chokidar";
import open from "open";
import {getKatnipDir} from "../main/katnip-main-util.js";
import fs from "fs";

export async function start(options) {
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
			let dirs=[process.cwd()];

			if (fs.lstatSync(process.cwd()+"/node_modules/katnip").isSymbolicLink()) {
				let d=fs.realpathSync(process.cwd()+"/node_modules/katnip");

				if (!dirs.includes(d))
					dirs.push(d);
			}

			let ignored=[
				"**/node_modules/**", "**/.git/**", "**/*.db*",
				"**/.env", "**/package.json", "**/package-lock.json", "**/yarn.lock",
				"**/katnip-cli.js"
			];

			ignored.push(options.media+"/**");

			let watcher=chokidar.watch(dirs,{
				ignored: ignored,
				persistent: true
			});

			watcher.on("ready",(ev, p)=>{
				for (let dir of dirs)
					console.log("Watching: "+dir);

				watcher.on("all",(ev, p)=>{
					parent.start();
					console.log(ev+" "+p);
				});
			});
		}

		process.on("SIGUSR2",()=>{
			console.log("Restarting due to SIGUSR2");
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
	},
	"api-delay": {
		desc: "Delay all api calls by millisecs."
	},
	"media": {
		desc: "Directory for uploaded media.",
		env: "MEDIA",
		default: process.cwd()+"/.media"
	},
	"ssr": {
		desc: "Do server side rendering.",
		type: "boolean",
		default: true
	},
};

export async function worker(options) {
	options.webProcessChild=new WebProcessChild();
	let katnip=await import(process.cwd()+"/node_modules/katnip/src/main/katnip-main-exports.js")
	await katnip.run(options);
}

worker.undoc=true;
worker.args=start.args;
