import WebProcessParent from "../../src/webprocess/WebProcessParent.js";
import WebProcessChild from "../../src/webprocess/WebProcessChild.js";
import chokidar from "chokidar";
import open from "open";

export async function start(options) {
	if (!options.port)
		options.port=3000;

	if (!options["no-spawn"]) {
		let parent=new WebProcessParent({
			modulePath: process.cwd()+"/node_modules/katnip/src/cli/katnip-cli.js",
			args: ["worker", ...process.argv.slice(3)],
			port: options.port,
		});

		if (!options["no-open"])
			open("http://localhost:3000");

		parent.start();

		if (!options["no-watch"]) {
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

		if (!options["no-open"])
			open("http://localhost:3000");
	}
}

start.desc="Start server.";
start.args={
	port: {
		desc: "Port to listen to.",
		env: "PORT"
	},
	"no-spawn": {
		desc: "Do not spawn child process.",
		type: "boolean",
	},
	"no-watch": {
		desc: "Do not watch files for changes.",
		type: "boolean"
	},
	"no-open": {
		desc: "Do not open browser.",
		type: "boolean"
	}
};

export async function worker(options) {
	options.webProcessChild=new WebProcessChild();
	let katnip=await import(process.cwd()+"/node_modules/katnip/src/main/katnip-main-exports.js")
	await katnip.run(options);
}

worker.undoc=true;
worker.args=start.args;
