import EventEmitter from "events";
import {useEventUpdate} from "../utils/react-util.jsx";
import {objectFirstKey, buildUrl} from "../utils/js-util.js";
import {installWsKeepAlive} from "../utils/ws-util.js";

export default class ChannelConnector extends EventEmitter {
	constructor(channelManager) {
		super();

		this.channelManager=channelManager;
		this.channelManager.on("newChannel",this.onNewChannel);
		this.channelManager.on("deleteChannel",this.onDeleteChannel);

		this.initWebSocket();
	}

	initWebSocket=()=>{
		console.log("WebSocket connecting...");
		let protocol;

		switch (window.location.protocol) {
			case "http:":
				protocol="ws";
				break;

			case "https:":
				protocol="wss";
				break;

			default:
				throw new Error("Unknown protocol: "+window.location.protocol);
		}

		let url=protocol+"://"+window.location.host;
		this.ws=new WebSocket(url);
		this.ws.addEventListener("open",this.onOpen);
		this.ws.addEventListener("message",this.onMessage);
		this.ws.addEventListener("close",this.onClose);
		this.ws.addEventListener("error",this.onClose);
		installWsKeepAlive(this.ws,{delay:10000});
	}

	sendMessage=(message)=>{
		this.ws.send(JSON.stringify(message));
	}

	isConnected=()=>{
		return (this.ws && this.ws.readyState==WebSocket.OPEN);
	}

	useWebSocketStatus=()=>{
		useEventUpdate("statusChange",this);
		return this.isConnected();
	}

	onMessage=(ev)=>{
		if (ev.data=="PING" || ev.data=="PONG")
			return;

		let messageData=JSON.parse(ev.data);
		switch (objectFirstKey(messageData)) {
			case "channel":
				let v=messageData.data;
				if (messageData.error)
					v=new Error(messageData.error);

				this.channelManager.setChannelValue(messageData.channel,v);
				break;

			default:
				console.log("Unknown message: "+JSON.stringify(messageData));
				break;
		}
	}

	onClose=()=>{
		console.log("WebSocket closed")

		this.channelManager.clearNonPersistent();

		this.ws.removeEventListener("open",this.onOpen);
		this.ws.removeEventListener("message",this.onMessage);
		this.ws.removeEventListener("close",this.onClose);
		this.ws.removeEventListener("error",this.onClose);
		this.ws=null;
		setTimeout(this.initWebSocket,5000);
		this.emit("statusChange");
	}

	onOpen=()=>{
		console.log("WebSocket open");
		for (let channelId of this.channelManager.getChannelIds()) {
			this.sendMessage({subscribe: channelId});
		}

		this.emit("statusChange");
	}

	onNewChannel=(channelId)=>{
		//console.log("new in conn: "+channelId+" isconn: "+this.isConnected());
		if (this.isConnected())
			this.sendMessage({subscribe: channelId});
	}

	onDeleteChannel=(channelId)=>{
		console.log("chan del: "+channelId);
		if (this.isConnected())
			this.sendMessage({unsubscribe: channelId});
	}
}