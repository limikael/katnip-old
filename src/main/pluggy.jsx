import {PluggyView} from "../components/pluggy-components.jsx";
import Db from "../utils/Db.js";

class Pluggy {
	constructor() {
		this.actions={};
		this.adminMessages=[];

		if (this.isServer()) {
			this.db=new Db("mysql://mysql:mysql@localhost/pluggy");
			this.apis={};
		}
	}

	addModel=(model)=>{
		if (!this.isServer())
			return;

		this.db.addModel(model);
	}

	addAction=(action, fn)=>{
		if (!this.actions[action])
			this.actions[action]=[];

		this.actions[action].push(fn);
	}

	addApi=(path, fn)=>{
		if (!this.isServer())
			return;

		this.apis[path]=fn;
	}

	doAction=(action, ...params)=>{
		if (!this.actions[action])
			return;

		let ret;
		for (let fn of this.actions[action]) {
			let v=fn(...params);
			if (v!==undefined)
				ret=v;
		}

		return ret;
	}

	refreshClient=()=>{
		this.refreshFunction();
	}

	setRefreshFunction=(refreshFunction)=>{
		this.refreshFunction=refreshFunction;
	}

	dismissAdminMessages=()=>{
		this.adminMessages=[];
		this.refreshClient();
	}

	getAdminMessages=()=>{
		return this.adminMessages;
	}

	showAdminMessage=(message, options={})=>{
		if (message instanceof Error) {
			message=message.message;
			options.variant="danger";
		}

		if (!options.variant)
			options.variant="success";

		options.alertClass=`alert-${options.variant}`;
		this.adminMessages.push({message,...options});
		this.refreshClient();
	}

	setLocation=(url, options={})=>{
		this.adminMessages=[];

		if (options.replace)
			history.replaceState(null,null,url);

		else
			history.pushState(null,null,url);

		this.refreshClient();
	}

	getCurrentRequest=()=>{
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

	isServer=()=>{
		return (typeof global!=="undefined");
	}

	isClient=()=>{
		return (typeof window!=="undefined");
	}

	clientMain=()=>{
		let el=document.getElementById("pluggy-root");
		render(<PluggyView />,el);
	}

	serverMain=async ()=>{
		await this.db.install();
	}
}

export * from "../components/pluggy-components.jsx";
export * from "../components/AdminListTable.jsx";
export * from "../components/ApiForm.jsx";
export * from "../utils/Db.js";
export * from "../utils/react-util.jsx";

export const pluggy=new Pluggy();
export default pluggy;

//export const addModel=pluggy.addModel;
