import child_process from "child_process";
import http from "http";
import net from "net";
import {delay, waitEvent} from "../../src/utils/js-util.js";
import EventEmitter from "events";
import IpcProxy from "./IpcProxy.js";
import {WebSocketServer} from "ws";
import path from "path";
import fs from "fs";

class CoverServer {
	constructor() {
		this.wsConnections=[];
	}

	handleRequest=(req, res)=>{
		console.log("SERVING COVER: "+req.url);

		res.setHeader("Cache-Control","no-store");
		res.setHeader('Connection', 'close');

		let dir=path.dirname(new URL(import.meta.url).pathname);
		res.end(fs.readFileSync(dir+"/cover.html"));
	}

	onWsConnection=(connection)=>{
		console.log("ws connection in cover");
		this.wsConnections.push(connection);

		connection.send(JSON.stringify({type: "runmode", runmode: "cover"}));
	}

	async listen(netServer) {
		this.httpServer=http.createServer(this.handleRequest);
		this.httpServer.listen(netServer);
		waitEvent(this.httpServer,"listening","error");

		this.wsServer=new WebSocketServer({server: this.httpServer});
		this.wsServer.on("connection",this.onWsConnection);
		this.wsConnections=[];
	}

	async close() {
		this.httpServer.close();
		this.wsServer.close();

		for (let connection of this.wsConnections)
			connection.send(JSON.stringify({type: "reload"}));
	}

	static async create(netServer) {
		let coverServer=new CoverServer();
		await coverServer.listen(netServer);

		return coverServer;
	}
}

export default class WebProcessParent {
	constructor(options={}) {
		this.modulePath=options.modulePath;
		this.port=options.port;
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
		}

		if (!this.coverServer)
			this.coverServer=await CoverServer.create(this.netServer);

		if (this.willStart) {
			this.willStart=false;
			this.childProcess=child_process.fork(this.modulePath);
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
