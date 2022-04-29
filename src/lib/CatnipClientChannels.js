import EventEmitter from "events";
import {useEventUpdate} from "catnip";

export default class CatnipClientChannels extends EventEmitter {
	constructor() {
		super();

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

		this.channelData={};

		console.log(this);
	}

	onMessage=(ev)=>{
		let messageData=JSON.parse(ev.data);

		this.channelData[messageData.channel]=messageData.data;
		this.emit(messageData.channel);
	}

	onOpen=()=>{
		console.log("WebSocket open");
	}

	sendMessage=(message)=>{
		this.ws.send(JSON.stringify(message));
	}

	useChannel=(channelId)=>{
		useEventUpdate(channelId,this);

		if (!this.channelData.hasOwnProperty(channelId)) {
			this.channelData[channelId]=undefined;
			this.sendMessage({subscribe: channelId});
		}

		return this.channelData[channelId];
	}

	addChannel=()=>{}
}