export * from "./catnip-imports.js";
import * as imports from "./catnip-imports.js";

import CatnipActions from "./CatnipActions.js";
import CatnipSessionManager from "./CatnipSessionManager.js";
import CatnipClientChannels from "./CatnipClientChannels.js";
import CatnipServerChannels from "./CatnipServerChannels.js";
import CatnipSettings from "./CatnipSettings.js";
import Db from "../orm/Db.js";
import {isClient, isServer} from "../utils/js-util.js";
import {createContext, useContext} from "preact/compat";

class Catnip {
	constructor() {
		this.actions=new CatnipActions();
		this.composeFunctions(this.actions);

		if (isServer()) {
			this.db=new Db();
			this.apis={};

			this.serverChannels=new CatnipServerChannels();
			this.composeFunctions(this.serverChannels);
		}

		if (isClient()) {
			this.TemplateContext=createContext();
		}

		this.sessionManager=new CatnipSessionManager(this.db);
		this.composeFunctions(this.sessionManager);

		this.settings=new CatnipSettings(this.db);
		this.composeFunctions(this.settings);

		if (isClient()) {
			this.clientChannels=new CatnipClientChannels();
			this.composeFunctions(this.clientChannels);
		}

		/*for (let k in this)
			if (typeof this[k]=='function' &&
					k!="composeFunctions" &&
					k!="load")
				console.log(`export const ${k}=catnip.${k};`);*/

		this.elements={};

		this.composeFunctions(imports);
		//console.log(imports);
	}

	useTemplateContext=()=>{
		return useContext(this.TemplateContext);
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

	clientMain=()=>{
		let el=document.getElementById("catnip-root");
		render(<this.CatnipView />,el);
	}

	serverMain=async (options)=>{
		await this.db.connect(options.dsn);

		if (!options.hasOwnProperty("dbinstall"))
			options["dbinstall"]=true;

		if (options["dbinstall"]) {
			console.log("Installing database schema...");
			await this.db.install();
		}

		await this.sessionManager.load();
		await this.settings.load();
	}
}

export const catnip=new Catnip();
export default catnip;

export const elements=catnip.elements;
export const db=catnip.db;

export const addElement=catnip.addElement;
export const addModel=catnip.addModel;
export const addApi=catnip.addApi;
export const clientMain=catnip.clientMain;
export const serverMain=catnip.serverMain;
export const addAction=catnip.addAction;
export const doAction=catnip.doAction;
export const doActionAsync=catnip.doActionAsync;
export const useSession=catnip.useSession;
export const withSession=catnip.withSession;
export const getSetting=catnip.getSetting;
export const setSetting=catnip.setSetting;
export const useChannel=catnip.useChannel;
export const addChannel=catnip.addChannel;
export const TemplateContext=catnip.TemplateContext;
export const useTemplateContext=catnip.useTemplateContext;
