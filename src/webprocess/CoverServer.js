import http from "http";
import {delay, waitEvent} from "../../src/utils/js-util.js";
import {WebSocketServer} from "ws";
import path from "path";
import fs from "fs";

export default class CoverServer {
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
