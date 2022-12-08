import {WebSocketServer} from "ws";
import {bindArgs, objectFirstKey, arrayRemove, buildUrl, decodeQueryString} from "../utils/js-util.js";
import {installWsKeepAlive} from "../utils/ws-util.js";
import KatnipServerRequest from "../auth/KatnipServerRequest.js";

export default class KatnipServerChannels {
	constructor(katnip, server) {
		this.katnip=katnip;
		this.channels={};
		this.connections=[];
	}

	attachToServer(server) {
		this.wss=new WebSocketServer({server}); 
		this.wss.on("connection",this.onConnection)
	}

	/**
	 * Add a realtime channel.
	 *
	 * This function adds a realtime channel. The channel handler function
	 * should return the current value of the channel. The value of the
	 * channel will be returned on the client side for corresponding
	 * calls to useChannel.
	 *
	 * The channel handler function will be called with the following
	 * arguments:
	 * * **query** - The channel query passed to the useChannel function.
	 * * **req**   - A Request object detailing the client trying to access
	 *               the channel.
	 *
	 * @function Server Functions.addChannel
	 * @param channelId:String The name of the channel.
	 * @param func:Function The function to return data for the channel.
	 */
	addChannel=(channelId, func)=>{
		this.katnip.assertFreeName(channelId);
		this.channels[channelId]=func;
	}

	/**
	 * Notify the system that the value of a realtime channel has been changed.
	 *
	 * All subscribers listening to the specified channel will receive new
	 * data. The data will be obtained by calling the channel handler function
	 * specified with the addChannel call.
	 *
	 * @function Server Functions.notifyChannel
	 * @param channelId:String The name of the channel.
	 * @param params:Object Filter out listeners by channel parameters.
	 */
	notifyChannel=(channelId, params={})=>{
		let channelUrl=buildUrl(channelId,params);

		this.onNotification(channelUrl);
	}

	getChannelData=async (channelUrl, req)=>{
		let [channelId,queryString]=channelUrl.split("?");
		let query=decodeQueryString(queryString);

		let settings=this.katnip.settingsManager.getSettings({id: channelId});
		if (settings.length) {
			let setting=settings[0];

			if (!setting.session)
				throw new Error("Setting not available as channel");

			return setting.value;
		}

		if (!this.channels[channelId])
			throw new Error("No such channel: "+channelId);

		return await this.channels[channelId](query, req);
	}

	assertFreeName=(name)=>{
		if (this.channels[name])
			throw new Error("Already a channel: "+name);
	}

	onConnection=(ws, req)=>{
		installWsKeepAlive(ws,{delay:5000});

		ws.req=req;
		ws.subscriptions=[];
		ws.on("close",bindArgs(this.onConnectionClose,ws));
		ws.on("message",bindArgs(this.onConnectionMessage,ws));

		ws.send(JSON.stringify({type: "runmode", runmode: "app"}));

		this.connections.push(ws);
	}

	onConnectionClose=(ws)=>{
		//console.log("close, subscriptions: "+JSON.stringify(ws.subscriptions));

		ws.removeAllListeners();
		arrayRemove(this.connections,ws);
	}

	send=(message)=>{
		console.log("broadcasting, connections="+this.connections.length);
		for (let ws of this.connections)
			ws.send(JSON.stringify(message));
	}

	sendChannelData=async (ws, channelId)=>{
		try {
			let req=new KatnipServerRequest(this.katnip,ws.req);
			req.processUrl(channelId);
			await req.initUserFromSession();

			let channelData=await this.getChannelData(channelId,req);
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