export * from "./pluggy-imports.js";
import * as imports from "./pluggy-imports.js";

import PluggyActions from "../components/PluggyActions.js";
import PluggySessionManager from "../components/PluggySessionManager.js";

class Pluggy {
	constructor() {
		this.composeFunctions(imports);

		this.actions=new PluggyActions();
		this.composeFunctions(this.actions);

		if (this.isServer()) {
			this.db=new this.Db("mysql://mysql:mysql@localhost/pluggy");
			this.apis={};
		}

		this.sessionManager=new PluggySessionManager(this.db);
		this.composeFunctions(this.sessionManager);

		this.adminMessages=[];

		this.elements={};
	}

	composeFunctions(o) {
		for (let k in o)
			if (typeof o[k]=='function')
				this[k]=o[k];
	}

	addElement(tag, func) {
		this.elements[tag]=func;
	}

	addModel=(model)=>{
		if (!this.isServer())
			return;

		this.db.addModel(model);
	}

	addApi=(path, fn)=>{
		if (!this.isServer())
			return;

		this.apis[path]=fn;
	}

	refreshClient=()=>{
		this.refreshFunction();
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

	clientMain=()=>{
		let el=document.getElementById("pluggy-root");
		render(<this.PluggyView />,el);
	}

	setRefreshFunction=(func)=>{
		this.refreshFunction=func;
	}

	serverMain=async ()=>{
		await this.db.install();
	}
}

export const pluggy=new Pluggy();
export default pluggy;

export const elements=pluggy.elements;
export const db=pluggy.db;

export const addModel=pluggy.addModel;
export const addAction=pluggy.addAction;
export const addApi=pluggy.addApi;
export const doAction=pluggy.doAction;
export const doActionAsync=pluggy.doActionAsync;
export const refreshClient=pluggy.refreshClient;
export const setRefreshFunction=pluggy.setRefreshFunction;
export const dismissAdminMessages=pluggy.dismissAdminMessages;
export const getAdminMessages=pluggy.getAdminMessages;
export const setLocation=pluggy.setLocation;
export const clientMain=pluggy.clientMain;
export const serverMain=pluggy.serverMain;
export const setActiveSessionId=pluggy.setActiveSessionId;
export const getActiveSessionId=pluggy.getActiveSessionId;
export const useSession=pluggy.useSession;
export const addElement=pluggy.addElement;
