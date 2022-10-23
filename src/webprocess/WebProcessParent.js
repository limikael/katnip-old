import child_process from "child_process";
import net from "net";
import {delay, waitEvent} from "../../src/utils/js-util.js";
import EventEmitter from "events";
import IpcProxy from "./IpcProxy.js";
import CoverServer from "./CoverServer.js";

export default class WebProcessParent {
	constructor(options={}) {
		this.modulePath=options.modulePath;
		this.port=options.port;
		this.args=options.args;
		this.coverMessage="Katnip loading and decrunching...";
	}

	start() {
		this.willStart=true;
		this.cycle();
	}

	async cycle() {
		if (this.isCycling)
			return;

		this.isCycling=true;

		if (this.childProcess) {
			this.childProcess.off("close",this.onChildProcessClose);
			if (!this.netServer)
				this.netServer=await this.childProcess.proxy.initializeClose();

			if (!this.coverServer)
				this.coverServer=await CoverServer.create(this.netServer, this.coverMessage);

			this.childProcess.proxy.finalizeClose();
			this.childProcess=null;
		}

		if (!this.netServer) {
			this.netServer=net.createServer();
			this.netServer.listen(this.port);
			await waitEvent(this.netServer,"listening","error");
			console.log("Parent process pid: "+process.pid+" listening to: "+this.port);
		}

		if (!this.coverServer)
			this.coverServer=await CoverServer.create(this.netServer, this.coverMessage);

		if (this.willStart) {
			this.willStart=false;
			this.childProcess=child_process.fork(this.modulePath,this.args,{
				silent: "true",
			});
			this.childProcess.ipcProxy=new IpcProxy(this.childProcess,{
				childInitialized: this.childInitialized,
				notifyChildListening: this.notifyChildListening,
				restartChild: this.restartChild
			});

			this.childProcess.proxy=this.childProcess.ipcProxy.proxy;
			this.childProcess.on("close",this.onChildProcessClose);

			this.childProcess.stdout.on("data",(data)=>{
				process.stdout.write(data);
				if (this.coverServer)
					this.coverServer.writeLogData(data);
			});

			this.childProcess.stderr.on("data",(data)=>{
				process.stderr.write(data);
				if (this.coverServer)
					this.coverServer.writeLogData(data);
			});
		}

		this.isCycling=false;
	}

	onChildProcessClose=(code)=>{
		console.log("child process closed, code: "+code);
		this.coverMessage="Child process crashed, exit code: "+code;
		this.childProcess.off("close",this.onChildProcessClose);
		this.childProcess=null;
		this.cycle();
	}

	childInitialized=async ()=>{
		let netServer=this.netServer;
		this.netServer=null;

		return netServer;
	}

	notifyChildListening=async ()=>{
		this.coverMessage="Katnip loading and decrunching...";

		await this.coverServer.close();
		this.coverServer=null;
	}

	restartChild=async ()=>{
		console.log("Restarting on child request...");
		this.start();
	}
}
