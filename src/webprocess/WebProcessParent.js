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
	}

	async start() {
		this.willStart=true;
		this.cycle();
	}

	async cycle() {
		if (this.isCycling)
			return;

		this.isCycling=true;

		if (this.childProcess) {
			if (!this.netServer)
				this.netServer=await this.childProcess.proxy.initializeClose();

			if (!this.coverServer)
				this.coverServer=await CoverServer.create(this.netServer);

			this.childProcess.proxy.finalizeClose();
			this.childProcess=null;
		}

		if (!this.netServer) {
			this.netServer=net.createServer();
			this.netServer.listen(this.port);
			await waitEvent(this.netServer,"listening","error");
			console.log("Parent process pid="+process.pid+", listening to: "+this.port);
		}

		if (!this.coverServer)
			this.coverServer=await CoverServer.create(this.netServer);

		if (this.willStart) {
			this.willStart=false;
			this.childProcess=child_process.fork(this.modulePath,this.args);
			this.childProcess.ipcProxy=new IpcProxy(this.childProcess,{
				childInitialized: this.childInitialized,
				notifyChildListening: this.notifyChildListening
			});

			this.childProcess.proxy=this.childProcess.ipcProxy.proxy;
		}

		this.isCycling=false;
	}

	childInitialized=async ()=>{
		let netServer=this.netServer;
		this.netServer=null;

		return netServer;
	}

	notifyChildListening=async ()=>{
		await this.coverServer.close();
		this.coverServer=null;
	}
}
