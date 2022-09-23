import {WebSocketServer} from "ws";
import {bindArgs, objectFirstKey, arrayRemove} from "../utils/js-util.js";
import {installWsKeepAlive} from "../utils/ws-util.js";
import KatnipRequest from "../lib/KatnipRequest.js";

export default class KatnipChannelHandler {
	constructor(katnip, server) {
		this.katnip=katnip;
		this.wss=new WebSocketServer({server}); 
		this.wss.on("connection",this.onConnection)

		this.connections=[];
		this.katnip.serverChannels.on("notification",this.onNotification);
	}

	onConnection=(ws, req)=>{
		installWsKeepAlive(ws,{delay:10000});

		ws.req=req;
		ws.subscriptions=[];
		ws.on("close",bindArgs(this.onConnectionClose,ws));
		ws.on("message",bindArgs(this.onConnectionMessage,ws));

		this.connections.push(ws);
	}

	onConnectionClose=(ws)=>{
		//console.log("close, subscriptions: "+JSON.stringify(ws.subscriptions));

		ws.removeAllListeners();
		arrayRemove(this.connections,ws);
	}

	sendChannelData=async (ws, channelId)=>{
		try {
			let req=new KatnipRequest();
			req.processNodeRequest(ws.req);
			req.processUrl(channelId);
			await this.katnip.doActionAsync("initRequest",req);

			let channelData=await this.katnip.getChannelData(channelId,req);
			ws.send(JSON.stringify({
				channel: channelId,
				data: channelData
			}));
		}

		catch (e) {
			console.log(e);
			ws.send(JSON.stringify({
				channel: channelId,
				error: e.message
			}));
		}
	}

	onConnectionMessage=async (ws, msg)=>{
		if (msg=="PING" || msg=="PONG")
			return;

		let messageData=JSON.parse(msg);
		//console.log(messageData);
		switch (objectFirstKey(messageData)) {
			case "subscribe":
				ws.subscriptions.push(messageData.subscribe);
				await this.sendChannelData(ws,messageData.subscribe);
				break;

			case "unsubscribe":
				arrayRemove(ws.subscriptions,messageData.unsubscribe);
				break;

			default:
				console.log("Unknown message: "+objectFirstKey(messageData));
				break;
		}
	}

	onNotification=async (channelId)=>{
		//console.log("notification... "+channelId);

		for (let ws of this.connections)
			if (ws.subscriptions.includes(channelId))
				await this.sendChannelData(ws,channelId);
	}
}