import {h, Fragment, render} from "preact";
import pluggy from "pluggy";
import PluggyView from "../components/PluggyView.jsx";

function main() {
	window.addEventListener("popstate",()=>{
		window.forcePluggyUpdate();
	});

	pluggy.doAction("start");
	pluggy.doAction("clientStart");

	let el=document.getElementById("pluggy-root");
	render(<PluggyView />,el);
}

setTimeout(main,0);
