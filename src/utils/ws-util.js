import {bindArgs} from "./js-util.js";

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