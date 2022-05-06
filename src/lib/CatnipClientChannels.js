import EventEmitter from "events";
import {useEventUpdate, useImmediateEffect} from "../utils/react-util.jsx";
import {objectFirstKey, buildUrl} from "../utils/js-util.js";

export default class CatnipClientChannels extends EventEmitter {
	constructor() {
		super();

		this.channelData={};
		this.channelRef={};

		this.initWebSocket();
	}

	initWebSocket=()=>{
		console.log("WebSocket connecting...");
		let protocol;

		switch (window.location.protocol) {
			case "http:":
				protocol="ws";
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
	}

	onMessage=(ev)=>{
		let messageData=JSON.parse(ev.data);

		switch (objectFirstKey(messageData)) {
			case "channel":
				if (messageData.data)
					this.channelData[messageData.channel]=messageData.data;

				else if (messageData.error)
					this.channelData[messageData.channel]=new Error(messageData.error);

				else
					this.channelData[messageData.channel]=undefined;

				this.emit("channel-"+messageData.channel);
				break;

			default:
				console.log("Unknown message: "+JSON.stringify(messageData));
				break;
		}
	}

	onClose=()=>{
		console.log("WebSocket closed")

		for (let channelUrl of Object.keys(this.channelData)) {
			this.channelData[channelUrl]=undefined;
			this.emit("channel-"+channelUrl);
		}

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
		for (let channelUrl of Object.keys(this.channelRef))
			this.sendMessage({subscribe: channelUrl});

		this.emit("statusChange");
	}

	sendMessage=(message)=>{
		this.ws.send(JSON.stringify(message));
	}

	increaseChannelRef=(channelUrl)=>{
		if (!this.channelRef.hasOwnProperty(channelUrl)) {
			this.channelRef[channelUrl]=0;
			this.channelData[channelUrl]=undefined;

			if (this.ws && this.ws.readyState==WebSocket.OPEN)
				this.sendMessage({subscribe: channelUrl});
		}

		this.channelRef[channelUrl]++;
	}

	decreaseChannelRef=(channelUrl)=>{
		this.channelRef[channelUrl]--;

		if (this.channelRef[channelUrl]==0) {
			delete this.channelRef[channelUrl];
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

		useEventUpdate("channel-"+channelUrl,this);
		useImmediateEffect(()=>{
			if (channelUrl)
				this.increaseChannelRef(channelUrl);

			return ()=>{
				if (channelUrl)
					this.decreaseChannelRef(channelUrl);
			}
		},[channelUrl]);

		return this.channelData[channelUrl];
	}

	useWebSocketStatus=()=>{
		useEventUpdate("statusChange",this);

		return (this.ws && this.ws.readyState==WebSocket.OPEN);
	}

	addChannel=()=>{}
}