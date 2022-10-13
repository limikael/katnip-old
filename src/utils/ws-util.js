import {bindArgs} from "./js-util.js";
import EventEmitter from "events";

class WsKeepAlive {
	constructor(ws,options={}) {
		this.ws=ws;
		this.options=options;
		if (!this.options.delay)
			this.options.delay=2000;

		if (ws.readyState==1)
			this.onOpen();

		else
			ws.addEventListener("open",this.onOpen);
	}

	onOpen=()=>{
		this.ws.removeEventListener("open",this.onOpen);

		this.ws.addEventListener("message",this.onMessage);
		this.ws.addEventListener("close",this.onDone);
		this.ws.addEventListener("error",this.onDone);

		this.pingTimeout=setTimeout(this.onPingTimeout,this.options.delay);
	}

	onMessage=(ev)=>{
		if (ev.data=="PING") {
			//console.log("ping? pong!")
			this.ws.send("PONG");
		}

		if (ev.data=="PONG") {
			if (!this.pongTimeout) {
				console.log("got pong, but no pong timeout, strange..");
				return;
			}

			clearTimeout(this.pongTimeout);
			this.pingTimeout=setTimeout(this.onPingTimeout,this.options.delay);
		}
	}

	onPingTimeout=()=>{
		this.pingTimeout=null;
		if (this.ws.readyState!=1) {
			this.cleanup();
			return;
		}

		//console.log("ping...");
		this.ws.send("PING");

		this.pongTimeout=setTimeout(this.onPongTimeout,this.options.delay);
	}

	onPongTimeout=()=>{
		console.log("pong timeout, closing!");
		this.cleanup();
		this.ws.close();
	}

	onDone=()=>{
		this.cleanup();
	}

	cleanup=()=>{
		this.ws.removeEventListener("open",this.onOpen);
		this.ws.removeEventListener("close",this.onDone);
		this.ws.removeEventListener("error",this.onDone);

		clearTimeout(this.pingTimeout);		
		clearTimeout(this.pongTimeout);
	}

	static install(ws, options={}) {
		ws.__keepAlive=new WsKeepAlive(ws,options);
	}
}

export function installWsKeepAlive(ws, options={}) {
	WsKeepAlive.install(ws,options);
}

export class EnhancedWebSocket extends EventEmitter {
	constructor(url, options={}) {
		super();

		if (typeof url=="object")
			options={...options, ...url};

		else
			this.url=url;

		if (!this.url) {
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

			this.url=protocol+"://"+window.location.host;
		}

		this.options=options;

		this.initWebSocket();
	}

	isConnected=()=>{
		return (this.ws && this.ws.readyState==WebSocket.OPEN);
	}

	initWebSocket=()=>{
		this.ws=new WebSocket(this.url);
		this.ws.addEventListener("open",this.onOpen);
		this.ws.addEventListener("message",this.onMessage);
		this.ws.addEventListener("close",this.onClose);
		this.ws.addEventListener("error",this.onClose);
		installWsKeepAlive(this.ws,{delay:5000});
	}

	onMessage=(ev)=>{
		if (ev.data=="PING" || ev.data=="PONG")
			return;

		let data=ev.data;
		if (this.options.encoding=="json")
			data=JSON.parse(ev.data);

		this.emit("message",data);
	}

	onClose=()=>{
		//console.log("WebSocket closed")

		this.ws.removeEventListener("open",this.onOpen);
		this.ws.removeEventListener("message",this.onMessage);
		this.ws.removeEventListener("close",this.onClose);
		this.ws.removeEventListener("error",this.onClose);
		this.ws=null;
		setTimeout(this.initWebSocket,5000);
		this.emit("statusChange");
	}

	onOpen=()=>{
		this.emit("statusChange");
	}
}