import {WebSocketServer} from "ws";
import {bindArgs, firstObjectKey} from "../utils/js-util.js";

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
		if (!this.catnip.isSession(cookies.catnip)) {
			ws.close();
			return;
		}

		ws.sessionId=cookies.catnip;
		ws.subscriptions=[];
		ws.on("close",bindArgs(this.onConnectionClose,ws));
		ws.on("message",bindArgs(this.onConnectionMessage,ws));

		this.connections.push(ws);
		//console.log("new connections, num="+this.connections.length);
	}

	onConnectionClose=(ws)=>{
		ws.removeAllListeners();
		let idx=this.connections.indexOf(ws);
		this.connections.splice(idx,1);
	}

	onConnectionMessage=async (ws, msg)=>{
		let messageData=JSON.parse(msg);
		console.log(messageData);
		switch (firstObjectKey(messageData)) {
			case "subscribe":
				ws.subscriptions.push(messageData.subscribe);
				await this.catnip.withSession(ws.sessionId,async ()=>{
					let channelData=await this.catnip.getChannelData(messageData.subscribe);
					ws.send(JSON.stringify({
						data: channelData,
						channel: messageData.subscribe
					}));
				});
				break;

			default:
				console.log("Unknown message: "+firstObjectKey(messageData));
				break;
		}

		//console.log(messageData);
	}

	onNotification=async (channelId)=>{
		console.log("notification... "+channelId);

		for (let ws of this.connections) {
			if (ws.subscriptions.includes(channelId)) {
				await this.catnip.withSession(ws.sessionId,async ()=>{
					let channelData=await this.catnip.getChannelData(channelId);
					ws.send(JSON.stringify({
						data: channelData,
						channel: channelId
					}));
				});
			}
		}
	}
}