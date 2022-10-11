import child_process from "child_process";
import http from "http";
import net from "net";
import {delay, waitEvent} from "../../src/utils/js-util.js";
import EventEmitter from "events";
import IpcProxy from "./IpcProxy.js";
import {WebSocketServer} from "ws";
import path from "path";
import fs from "fs";

// child state: idle, starting, running
export default class WebProcessParent {
	constructor(options={}) {
		this.modulePath=options.modulePath;
		this.port=options.port;
		this.childState="idle";
	}

	async stop() {
		this.netServer=await this.child.initializeClose();
		await this.createWebServer();

		this.child.finalizeClose();
	}

	async listen() {
		this.netServer=net.createServer();
		this.netServer.listen(this.port);
		await waitEvent(this.netServer,"listening","error");
	}

	async start() {
		await this.listen();

		await this.createWebServer();

		this.childProcess=child_process.fork(this.modulePath);
		this.childIpcProxy=new IpcProxy(this.childProcess,{
			childInitialized: this.childInitialized,
			notifyChildListening: this.notifyChildListening
		});
		this.child=this.childIpcProxy.proxy;
	}

	handleRequest=(req, res)=>{
		res.setHeader("Cache-Control","no-store");
		res.setHeader('Connection', 'close');

		let dir=path.dirname(new URL(import.meta.url).pathname);
		res.end(fs.readFileSync(dir+"/cover.html"));
	}

	async createWebServer() {
		this.httpServer=http.createServer(this.handleRequest);

		this.httpServer.listen(this.netServer);
		waitEvent(this.httpServer,"listening","error");

		this.wsServer=new WebSocketServer({server: this.httpServer});
		this.wsServer.on("connection",this.onWsConnection);
		this.wsConnections=[];

		console.log("http server listening");
	}

	onWsConnection=(connection)=>{
		console.log("ws connection");
		this.wsConnections.push(connection);
	}

	childInitialized=async ()=>{
		console.log("child initialized");
		return this.netServer;
	}

	notifyChildListening=async ()=>{
		for (let connection of this.wsConnections)
			connection.send(JSON.stringify({type: "reload"}));

		console.log("child listening");
		this.httpServer.close();
		this.httpServer=null;

		this.wsServer.close();
		this.wsServer=null;
	}
}
