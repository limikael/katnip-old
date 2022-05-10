import CatnipActions from "./CatnipActions.js";
import CatnipSessionManager from "./CatnipSessionManager.js";
import CatnipClientChannels from "./CatnipClientChannels.js";
import CatnipServerChannels from "./CatnipServerChannels.js";
import CatnipServerSessions from "./CatnipServerSessions.js";
import CatnipSettings from "./CatnipSettings.js";
import Db from "../orm/Db.js";
import {CatnipView} from "../components/CatnipView.jsx";
import {isClient, isServer} from "../utils/js-util.js";
import {createContext, useContext} from "preact/compat";
import {pathMatch} from "../utils/path-match.js"; 

class Catnip {
	constructor() {
		this.actions=new CatnipActions();
		this.composeFunctions(this.actions);

		if (isServer()) {
			this.db=new Db();
			this.apis={};

			this.serverChannels=new CatnipServerChannels();
			this.composeFunctions(this.serverChannels);

			this.serverSessions=new CatnipServerSessions(this);
			this.composeFunctions(this.serverSessions);

			this.settings=new CatnipSettings(this.db);
			this.composeFunctions(this.settings);
		}

		if (isClient()) {
			this.TemplateContext=createContext();

			this.sessionManager=new CatnipSessionManager();
			this.composeFunctions(this.sessionManager);

			this.clientChannels=new CatnipClientChannels();
			this.composeFunctions(this.clientChannels);

		}

		this.elements={};
		this.templates={};
		this.routes={};

		/*for (let k in this)
			if (typeof this[k]=='function' &&
					k!="composeFunctions" &&
					k!="load")
				console.log(`export const ${k}=catnip.${k};`);*/
	}

	addRoute=(route, component)=>{
		this.routes[route]=component;
	}

	addTemplate=(route, component)=>{
		this.templates[route]=component;
	}

	getTemplateForRoute=(route)=>{
		return this.selectComponentForRoute(this.templates,route);
	}

	getPageComponentForRoute=(route)=>{
		return this.selectComponentForRoute(this.routes,route);
	}

	selectComponentForRoute=(patterns, route)=>{
		let bestMatch="z";
		let component;

		for (let k in patterns) {
			let kMatch=pathMatch(k,route)
			if (kMatch && kMatch<bestMatch) {
				bestMatch=kMatch;
				component=patterns[k]
			}
		}

		return component;
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
		if (!isServer())
			return;

		this.db.addModel(model);
	}

	addApi=(path, fn)=>{
		if (!isServer())
			return;

		this.apis[path]=fn;
	}

	clientMain=()=>{
		this.doActionAsync("clientMain",this.sessionManager.clientSession);

		let el=document.getElementById("catnip-root");
		render(<CatnipView />,el);
	}

	serverMain=async (options)=>{
		//console.log(global);
		await this.db.connect(options.dsn);

		if (!options.hasOwnProperty("dbinstall"))
			options["dbinstall"]=true;

		if (options["dbinstall"]) {
			console.log("Installing database schema...");
			await this.db.install();
		}

		await this.serverSessions.loadSessions();
		await this.settings.loadSettings();

		await this.doActionAsync("serverMain",options);
	}
}

const catnip=new Catnip();

export const elements=catnip.elements;
export const db=catnip.db;
export const serverChannels=catnip.serverChannels;
export const apis=catnip.apis;
export const TemplateContext=catnip.TemplateContext;

export const addElement=catnip.addElement;
export const addModel=catnip.addModel;
export const addApi=catnip.addApi;
export const clientMain=catnip.clientMain;
export const serverMain=catnip.serverMain;
export const addAction=catnip.addAction;
export const doAction=catnip.doAction;
export const doActionAsync=catnip.doActionAsync;
export const useSession=catnip.useSession;
export const getSetting=catnip.getSetting;
export const setSetting=catnip.setSetting;
export const useChannel=catnip.useChannel;
export const useWebSocketStatus=catnip.useWebSocketStatus;
export const addChannel=catnip.addChannel;
export const useTemplateContext=catnip.useTemplateContext;
export const initSessionRequest=catnip.initSessionRequest;
export const getChannelData=catnip.getChannelData;
export const notifyChannel=catnip.notifyChannel;

export const addRoute=catnip.addRoute;
export const addTemplate=catnip.addTemplate;
export const getTemplateForRoute=catnip.getTemplateForRoute;
export const getPageComponentForRoute=catnip.getPageComponentForRoute;
