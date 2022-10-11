import child_process from "child_process";
import http from "http";
import net from "net";
import {delay} from "../../src/utils/js-util.js";
import EventEmitter from "events";
import IpcProxy from "./IpcProxy.js";

export default class WebProcessChild {
	constructor(options={}) {
		this.parentIpcProxy=new IpcProxy(process,options.expose);
		this.parent=this.parentIpcProxy.proxy;
	}

	async initialized() {
		return await this.parent.childInitialized();
	}

	async notifyListening() {
		return await this.parent.notifyChildListening();
	}
}