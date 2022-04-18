import {useContext,createContext,useRef,useState} from "preact/compat";
import {useForceUpdate} from "../utils/react-util.jsx";
import AdminListTable from "../components/AdminListTable.jsx";
import {buildUrl} from "../utils/react-util.jsx";
import {useApiForm} from "../components/ApiForm.jsx";
import Db, {Model} from "../utils/Db.js";

let db=new Db("mysql://mysql:mysql@localhost/pluggy");
let adminMessages=[];

export {
	AdminListTable as AdminListTable,
	buildUrl as buildUrl,
	useApiForm as useApiForm,
	Model as Model,
	db as db
};

export function AdminMessages() {
	return adminMessages.map(({message, alertClass})=>(
		<div class={`alert alert-dismissible ${alertClass}`}>
			<button type="button" class="btn-close" data-bs-dismiss="alert"
					onclick={dismissAdminMessages}></button>
			{message}
		</div>
	));
}

export function addModel(model) {
	db.addModel(model);
}

export const PluggyContext=createContext();

export async function apiFetch(url, query={}) {
	url=buildUrl(url,query);

	let response=await fetch(url);
	let data=await response.json();

	return data;
}

export function useApiFetch(url, query={}) {
	let ref=useRef();
	let [data,setData]=useState(null);

	function invalidate() {
		fetch(url).then(async(response)=>{
			setData(await response.json());
		});
	}

	if (!ref.current) {
		ref.current=true;
		invalidate();
	}

	return {data, invalidate};
}

export function getAdminMessages() {
	return adminMessages;
}

export function dismissAdminMessages() {
	adminMessages=[];
	window.forcePluggyUpdate;
}

export function showAdminMessage(message, options={}) {
	if (message instanceof Error) {
		message=message.message;
		options.variant="danger";
	}

	if (!options.variant)
		options.variant="success";

	options.alertClass=`alert-${options.variant}`;
	adminMessages.push({message,...options});
	window.forcePluggyUpdate();
}

export function setLocation(url, options={}) {
	adminMessages=[];

	if (options.replace)
		history.replaceState(null,null,url);

	else
		history.pushState(null,null,url);

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
	useApiFetch,
	AdminListTable,
	setLocation,
	buildUrl,
	db,
	Model,
	addModel,
	showAdminMessage,
	getAdminMessages,
	apiFetch,
	dismissAdminMessages
}