import child_process from "child_process";
import http from "http";
import net from "net";
import {delay, waitEvent} from "../../src/utils/js-util.js";
import EventEmitter from "events";
import IpcProxy from "./IpcProxy.js";
import {WebSocketServer} from "ws";
import path from "path";
import fs from "fs";

export default class WebProcessParent {
	constructor(options={}) {
		this.modulePath=options.modulePath;
		this.port=options.port;
		this.expose=options.expose;
	}

	async listen() {
		this.netServer=net.createServer();
		this.netServer.listen(this.port);
		await waitEvent(this.netServer,"listening","error");
	}

	async start() {
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
		await this.listen();

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
			connection.send("hello");

		console.log("child listening");
		this.httpServer.close();
	}
}
