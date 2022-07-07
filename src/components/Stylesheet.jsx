import {useTemplateContext} from "../browser/catnip-browser.jsx";
import {useBlockingResource} from "../utils/blocking-resource.jsx";

export function Stylesheet({href}) {
	let resolve=useBlockingResource(href);

	return (
		<link key={href} rel="stylesheet" href={href} onload={resolve} onabort={resolve} onerror={resolve}/>
	);
}