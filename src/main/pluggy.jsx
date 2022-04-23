export * from "./pluggy-imports.js";
import * as imports from "./pluggy-imports.js";

import PluggyActions from "../components/PluggyActions.js";
import PluggySessionManager from "../components/PluggySessionManager.js";
import PluggySettings from "../components/PluggySettings.js";
import Db from "../utils/Db.js";
import {isClient, isServer} from "../utils/web-util.js";

class Pluggy {
	constructor() {
		this.actions=new PluggyActions();
		this.composeFunctions(this.actions);

		if (isServer()) {
			this.db=new Db("mysql://mysql:mysql@localhost/pluggy");
			this.apis={};
		}

		this.sessionManager=new PluggySessionManager(this.db);
		this.composeFunctions(this.sessionManager);

		this.settings=new PluggySettings(this.db);
		this.composeFunctions(this.settings);

		/*for (let k in this)
			if (typeof this[k]=='function' &&
					k!="composeFunctions" &&
					k!="load")
				console.log(`export const ${k}=pluggy.${k};`);*/

		this.adminMessages=[];

		this.elements={};

		this.composeFunctions(imports);
	}

	composeFunctions=(o)=>{
		for (let k in o)
			if (typeof o[k]=='function')
				this[k]=o[k];
	}

	addElement=(tag, func)=> {
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
		window.addEventListener("popstate",(ev)=>{
			this.refreshClient();
		});

		let el=document.getElementById("pluggy-root");
		render(<this.PluggyView />,el);
	}

	setRefreshFunction=(func)=>{
		this.refreshFunction=func;
	}

	serverMain=async ()=>{
		await this.db.install();
		await this.sessionManager.load();
		await this.settings.load();
	}
}

export const pluggy=new Pluggy();
export default pluggy;

export const elements=pluggy.elements;
export const db=pluggy.db;

export const addElement=pluggy.addElement;
export const addModel=pluggy.addModel;
export const addApi=pluggy.addApi;
export const refreshClient=pluggy.refreshClient;
export const dismissAdminMessages=pluggy.dismissAdminMessages;
export const getAdminMessages=pluggy.getAdminMessages;
export const showAdminMessage=pluggy.showAdminMessage;
export const setLocation=pluggy.setLocation;
export const clientMain=pluggy.clientMain;
export const setRefreshFunction=pluggy.setRefreshFunction;
export const serverMain=pluggy.serverMain;
export const addAction=pluggy.addAction;
export const doAction=pluggy.doAction;
export const doActionAsync=pluggy.doActionAsync;
export const useSession=pluggy.useSession;
export const withSession=pluggy.withSession;
export const getSetting=pluggy.getSetting;
export const setSetting=pluggy.setSetting;
