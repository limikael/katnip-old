import {useBlockingResource} from "../utils/blocking-resource.jsx";

/**
 * Load a css stylesheet.
 *
 * Load a css stylesheet, and block rendering until the css is loaded.
 *
 * @component React Components.Stylesheet
 * @param href:String The url of the stylesheet to load.
 */
export function Stylesheet({href}) {
	let resolve=useBlockingResource(href);

	//console.log("stylesheet: "+href);

	return (
		<link key={href} rel="stylesheet" href={href} onload={resolve} onabort={resolve} onerror={resolve}/>
	);
}