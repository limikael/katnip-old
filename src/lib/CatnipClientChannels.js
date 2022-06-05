import EventEmitter from "events";
import {useEventUpdate, useImmediateEffect} from "../utils/react-util.jsx";
import {objectFirstKey, buildUrl} from "../utils/js-util.js";
import {installWsKeepAlive} from "../utils/ws-util.js";

class ChannelData extends EventEmitter {
	constructor(id) {
		super();

		this.id=id;
		this.ref=0;
	}

	processMessage(message) {
		if (message.error)
			this.value=message.error;

		else
			this.value=message.data;

		this.emit("change");
	}

	setValue(value) {
		this.value=value;
		this.emit("change");
	}
}

export default class CatnipClientChannels extends EventEmitter {
	constructor() {
		super();

		this.channelData={};
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

	onMessage=(ev)=>{
		if (ev.data=="PING" || ev.data=="PONG")
			return;

		let messageData=JSON.parse(ev.data);
		switch (objectFirstKey(messageData)) {
			case "channel":
				let channelData=this.channelData[messageData.channel];
				if (channelData)
					channelData.processMessage(messageData);

				else
					console.log("Bad channel: "+JSON.stringify(messageData));
				break;

			default:
				console.log("Unknown message: "+JSON.stringify(messageData));
				break;
		}
	}

	onClose=()=>{
		console.log("WebSocket closed")

		for (let channelUrl of Object.keys(this.channelData))
			this.channelData[channelUrl].setValue(undefined);

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
		for (let channelUrl of Object.keys(this.channelData))
			this.sendMessage({subscribe: channelUrl});

		this.emit("statusChange");
	}

	sendMessage=(message)=>{
		this.ws.send(JSON.stringify(message));
	}

	increaseChannelRef=(channelUrl)=>{
		if (!this.channelData[channelUrl]) {
			this.channelData[channelUrl]=new ChannelData(channelUrl);
			if (this.ws && this.ws.readyState==WebSocket.OPEN)
				this.sendMessage({subscribe: channelUrl});
		}

		this.channelData[channelUrl].ref++;
	}

	decreaseChannelRef=(channelUrl)=>{
		if (!this.channelData[channelUrl]) {
			console.log("Count already zero: "+channelUrl);
			return;
		}

		this.channelData[channelUrl].ref--;

		if (this.channelData[channelUrl].ref==0) {
			delete this.channelData[channelUrl];

			if (this.ws && this.ws.readyState==WebSocket.OPEN)
				this.sendMessage({unsubscribe: channelUrl});
		}
	}

	useChannel=(channelIdOrFunc, params={})=>{
		let channelUrl;
		if (typeof channelIdOrFunc=="function") {
			let v=channelIdOrFunc();
			if (v)
				channelUrl=buildUrl(v[0],v[1]);
		}

		else {
			channelUrl=buildUrl(channelIdOrFunc,params);
		}

		useImmediateEffect(()=>{
			if (channelUrl)
				this.increaseChannelRef(channelUrl);

			return ()=>{
				if (channelUrl)
					this.decreaseChannelRef(channelUrl);
			}
		},[channelUrl]);
		useEventUpdate("change",this.channelData[channelUrl]);

		return this.channelData[channelUrl].value;
	}

	useWebSocketStatus=()=>{
		useEventUpdate("statusChange",this);

		return (this.ws && this.ws.readyState==WebSocket.OPEN);
	}

	addChannel=()=>{}
}