import {useContext,createContext,useRef,useState} from "preact/compat";
import {useForceUpdate} from "../utils/react-util.jsx";
import AdminListTable from "../components/AdminListTable.jsx";
import {buildUrl} from "../utils/react-util.jsx";

export {
	AdminListTable as AdminListTable,
	buildUrl as buildUrl
};

export const PluggyContext=createContext();

export function useApi(funcName, query={}) {
	let ref=useRef();
	let [value,setValue]=useState(null);

	if (!ref.current) {
		ref.current=true;
		fetch("/api/"+funcName).then(async(response)=>{
			let data=await response.json();
			setValue(data);
		});
	}

	return value;
}

export function setLocation(url, ctx) {
	let state={url: url};
	history.pushState(state,"",url);

	window.forcePluggyUpdate();
}

export function A({children, ...props}) {
	function onClick(ev) {
		ev.preventDefault();
		setLocation(props.href);
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
	PluggyContext,
	useApi,
	AdminListTable,
	setLocation,
	buildUrl
}