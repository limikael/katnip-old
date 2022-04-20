export * from "./pluggy-imports.js";
import * as imports from "./pluggy-imports.js";

class Pluggy {
	constructor() {
		Object.assign(this,imports);

		this.actions={};
		this.adminMessages=[];

		if (this.isServer()) {
			this.db=new this.Db("mysql://mysql:mysql@localhost/pluggy");
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
		this.clientMain();
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
		render(<this.PluggyView />,el);
	}

	serverMain=async ()=>{
		await this.db.install();
	}
}

export const pluggy=new Pluggy();
export default pluggy;

export const addModel=pluggy.addModel;
export const addAction=pluggy.addAction;
export const addApi=pluggy.addApi;
export const doAction=pluggy.doAction;
export const refreshClient=pluggy.refreshClient;
export const setRefreshFunction=pluggy.setRefreshFunction;
export const dismissAdminMessages=pluggy.dismissAdminMessages;
export const getAdminMessages=pluggy.getAdminMessages;
export const setLocation=pluggy.setLocation;
export const getCurrentRequest=pluggy.getCurrentRequest;
export const isServer=isServer;
export const isClient=isClient;
export const clientMain=clientMain;
export const serverMain=serverMain;
