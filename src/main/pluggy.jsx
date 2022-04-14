import {useContext,createContext} from "preact/compat";
import {useForceUpdate} from "../utils/react-util.jsx";

export const PluggyContext=createContext();

export function A({children, ...props}) {
	let ctx=useContext(PluggyContext);

	function onClick(ev) {
		ev.preventDefault();

		let state={url: props.href};
		history.pushState(state,"",props.href);

		ctx.forceUpdate();
	}

	return (
		<a {...props} onclick={onClick}>
			{children}
		</a>
	);
}

export function doAction(action, ...params) {
	let plugins=getPlugins();

	for (let pluginName in plugins) {
		let plugin=plugins[pluginName];

		if (plugin[action])
			plugin[action](...params);
	}
}

export function applyFilters(action, val, ...params) {
	let plugins=getPlugins();

	for (let pluginName in getPlugins()) {
		let plugin=plugins[pluginName];

		if (plugin[action]) {
			let newVal=plugin[action](val,...params);
			if (newVal!==undefined)
				val=newVal;
		}
	}

	return val;
}

export function getPlugins() {
	if (typeof window!=="undefined")
		return window.pluggyPlugins;

	if (typeof global!=="undefined")
		return global.pluggyPlugins;
}

export function getCurrentRequest() {
	let l=window.location;
	let query=Object.fromEntries(new URLSearchParams(l.search));
	let params=l.pathname.split("/").filter(s=>s.length>0);
	let path="/"+params.join("/");

	return {
		params,
		path,
		query
	};
}

export default {
	getPlugins,
	doAction,
	applyFilters,
	getCurrentRequest,
	A,
	PluggyContext
}