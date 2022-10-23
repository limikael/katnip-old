import http from "http";
import {delay, waitEvent, arrayRemove} from "../../src/utils/js-util.js";
import {installWsKeepAlive} from "../../src/utils/ws-util.js";
import {WebSocketServer} from "ws";
import path from "path";
import fs from "fs";

export default class CoverServer {
	constructor(initialLog) {
		this.wsConnections=[];
		this.log=initialLog+"\n";
	}

	handleRequest=(req, res)=>{
		console.log("SERVING COVER: "+req.url);

		res.setHeader("Cache-Control","no-store");
		res.setHeader('Connection', 'close');

		let dir=path.dirname(new URL(import.meta.url).pathname);
		let template=fs.readFileSync(dir+"/cover.html","utf8");
		let bundle=fs.readFileSync(dir+"/cover-main.bundle.js","utf8");

		res.end(template.replace("__bundle__",bundle));

	}

	writeLogData(data) {
		data=data.toString();
		this.log+=data;

		for (let ws of this.wsConnections)
			ws.send(JSON.stringify({type: "log", "log": data}));
	}

	onWsConnection=(ws)=>{
		console.log("ws connection in cover");
		installWsKeepAlive(ws,{delay:5000});

		this.wsConnections.push(ws);
		ws.send(JSON.stringify({type: "runmode", runmode: "cover"}));
		ws.send(JSON.stringify({type: "backlog", log: this.log}));
	}

	onConnectionClose=(ws)=>{
		console.log("ws connection close in cover");

		ws.removeAllListeners();
		arrayRemove(this.wsConnections,ws);
	}

	onWsMessage=(ws, message)=>{
		console.log("got ws message: "+message);
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

	static async create(netServer, message) {
		let coverServer=new CoverServer(message);
		await coverServer.listen(netServer);

		return coverServer;
	}
}
