import {useTemplateContext} from "../browser/katnip-browser.jsx";
import {useBlockingResource} from "../utils/blocking-resource.jsx";

export function Stylesheet({href}) {
	let resolve=useBlockingResource(href);

	//console.log("stylesheet: "+href);

	return (
		<link key={href} rel="stylesheet" href={href} onload={resolve} onabort={resolve} onerror={resolve}/>
	);
}