import {WebSocketServer} from "ws";
import {bindArgs, objectFirstKey, arrayRemove, getRequestOrigin} from "../utils/js-util.js";
import {installWsKeepAlive} from "../utils/ws-util.js";

export default class CatnipChannelHandler {
	constructor(catnip, server) {
		this.catnip=catnip;
		this.wss=new WebSocketServer({server}); 
		this.wss.on("connection",this.onConnection)

		this.connections=[];
		this.catnip.serverChannels.on("notification",this.onNotification);
	}

	onConnection=(ws, req)=>{
		installWsKeepAlive(ws,{delay:10000});

		let cookies=this.catnip.parseCookies(req);
		ws.req=req;
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

	getOrigin=(req)=>{
		let protocol="http";
		if (req.headers["x-forwarded-proto"])
			protocol=req.headers["x-forwarded-proto"];

		let origin=protocol+"://"+req.headers.host;
		return origin;
	}

	sendChannelData=async (ws, channelId)=>{
		/*let sessionRequest=await this.catnip.initSessionRequest(ws.cookie);
		sessionRequest.origin=getRequestOrigin(ws.req);*/

		try {
			let channelData=await this.catnip.getChannelData(channelId/*,sessionRequest*/);
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