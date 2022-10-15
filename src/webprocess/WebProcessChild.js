import child_process from "child_process";
import http from "http";
import net from "net";
import {delay} from "../../src/utils/js-util.js";
import EventEmitter from "events";
import IpcProxy from "./IpcProxy.js";

export default class WebProcessChild extends EventEmitter {
	constructor(options={}) {
		super();

		this.parentIpcProxy=new IpcProxy(process,{
			initializeClose: this.initializeClose,
			finalizeClose: this.finalizeClose
		});
		this.parent=this.parentIpcProxy.proxy;
	}

	initializeClose=async ()=>{
		return this.netServer;
	}

	finalizeClose=async ()=>{
		this.emit("stop");
		process.exit();
	}

	initialized=async ()=>{
		this.netServer=await this.parent.childInitialized();
		return this.netServer;
	}

	notifyListening=async ()=>{
		return await this.parent.notifyChildListening();
	}

	restart=async ()=>{
		return await this.parent.restartChild();
	}
}