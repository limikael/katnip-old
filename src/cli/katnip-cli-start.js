import WebProcessParent from "../../src/webprocess/WebProcessParent.js";
import WebProcessChild from "../../src/webprocess/WebProcessChild.js";
import chokidar from "chokidar";

export async function start(options) {
	if (!options.port)
		options.port=3000;

	if (options.spawn) {
		let parent=new WebProcessParent({
			modulePath: process.cwd()+"/node_modules/katnip/src/cli/katnip-cli.js",
			args: ["worker", ...process.argv.slice(3)],
			port: options.port,
		});

		parent.start();

		if (options.watch) {
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
		}

		process.on("SIGUSR2",()=>{
			console.log("*******");
			parent.start();
		});
	}

	else {
		let katnip=await import(process.cwd()+"/node_modules/katnip/src/main/katnip-main-exports.js")
		await katnip.run(options);
	}
}

start.shortdesc="Start server.";
start.args={
	port: {
		shortdesc: "Port to listen to.",
		env: "PORT"
	},
	spawn: {
		boolean: true,
		negativedesc: "Don't spawn child process."
	},
	watch: {
		boolean: true,
		negativedesc: "Don't watch files for changes."
	}
};

export async function worker(options) {
	options.webProcessChild=new WebProcessChild();
	let katnip=await import(process.cwd()+"/node_modules/katnip/src/main/katnip-main-exports.js")
	await katnip.run(options);
}

worker.undoc=true;
worker.args=start.args;
