import {WebSocketServer} from "ws";
import {bindArgs, objectFirstKey, arrayRemove} from "../utils/js-util.js";

export default class CatnipChannelHandler {
	constructor(catnip, server) {
		this.catnip=catnip;
		this.wss=new WebSocketServer({server}); 
		this.wss.on("connection",this.onConnection)

		this.connections=[];
		this.catnip.serverChannels.on("notification",this.onNotification);
	}

	onConnection=(ws, req)=>{
		let cookies=this.catnip.parseCookies(req);
		ws.cookie=cookies.catnip;
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
		let sessionRequest=await this.catnip.initSessionRequest(ws.cookie);
		try {
			let channelData=await this.catnip.getChannelData(channelId,sessionRequest);
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