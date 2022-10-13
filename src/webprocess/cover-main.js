import {EnhancedWebSocket} from "../../src/utils/ws-util.js";

let ws=new EnhancedWebSocket({
	encoding: "json",
});

ws.on("statusChange",()=>{
	let el=document.getElementById("connecting");

	if (ws.isConnected())
		el.style.display="none";

	else
		el.style.display="block";

	console.log("connected: "+ws.isConnected());
});

ws.on("message",(message)=>{
	switch (message.type) {
		case "reload":
			window.location=window.location;
			break;

		case "runmode":
			if (message.runmode!="cover")
				window.location=window.location;
			break;

		case "backlog":
			document.getElementById("console").textContent=message.log;
			window.scrollTo(0, document.body.scrollHeight);
			break;

		case "log":
			document.getElementById("console").textContent+=message.log;
			window.scrollTo(0, document.body.scrollHeight);
			break;

		default:
			console.log("Unknown message");
			console.log(message);
			break;
	}
});

document.getElementById("console").textContent+="hello";