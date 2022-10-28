import http from "http";
import {delay} from "../../../src/utils/js-util.js";
import WebProcessChild from "../../../src/webprocess/WebProcessChild.js";
import {WebSocketServer} from "ws";
import path from "path";
import fs from "fs";

let child=new WebProcessChild();
let server=http.createServer((req,res)=>{
	console.log("SERVING CHILD PAGE...");

	res.setHeader("Cache-Control","no-store");
	res.setHeader('Connection', 'close');

	let dir=path.dirname(new URL(import.meta.url).pathname);
	res.end(fs.readFileSync(dir+"/childpage.html"));
});

let wsServer=new WebSocketServer({server});
let wsConnections=[];

wsServer.on("connection",(ws)=>{
	console.log("got connection in child");

	ws.send(JSON.stringify({type: "runmode", runmode: "app"}));

	wsConnections.push(ws)
});

child.on("stop",()=>{
	console.log("exiting child!!!");

	server.close();
	for (let connection of wsConnections)
		connection.send(JSON.stringify({type: "reload"}));

	process.exit();
});

console.log("Child: "+process.pid);
await delay(2000);

let parentServer=await child.initialized();

server.listen(parentServer);

server.once("listening",()=>{
	child.notifyListening();
});

console.log("Child is up: "+process.pid);

process.on("SIGUSR2",()=>{
	console.log("got usr2 in child");
});

