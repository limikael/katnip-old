import CatnipActions from "../lib/CatnipActions.js";
import CatnipSessionManager from "../lib/CatnipSessionManager.js";
import CatnipClientChannels from "../lib/CatnipClientChannels.js";
import {CatnipView} from "../components/CatnipView.jsx";
import {createContext, useContext} from "preact/compat";
import {pathMatch} from "../utils/path-match.js"; 

class BrowserCatnip {
	constructor() {
		this.actions=new CatnipActions();
		this.composeFunctions(this.actions);

		this.TemplateContext=createContext();

		this.sessionManager=new CatnipSessionManager();
		this.composeFunctions(this.sessionManager);

		this.clientChannels=new CatnipClientChannels();
		this.composeFunctions(this.clientChannels);

		this.elements={};
		this.templates={};
		this.routes={};
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

	clientMain=()=>{
		this.doActionAsync("clientMain",this.sessionManager.clientSession);

		let el=document.getElementById("catnip-root");
		render(<CatnipView />,el);
	}
}

const catnip=new BrowserCatnip();

export const elements=catnip.elements;
export const TemplateContext=catnip.TemplateContext;

export const addElement=catnip.addElement;
export const addModel=catnip.addModel;
export const addApi=catnip.addApi;
export const clientMain=catnip.clientMain;
export const addAction=catnip.addAction;
export const doAction=catnip.doAction;
export const doActionAsync=catnip.doActionAsync;
export const useSession=catnip.useSession;
export const useChannel=catnip.useChannel;
export const setChannelPersistence=catnip.setChannelPersistence;
export const getChannelValue=catnip.setChannelValue;
export const setChannelValue=catnip.setChannelValue;
export const useWebSocketStatus=catnip.useWebSocketStatus;
export const addChannel=catnip.addChannel;
export const useTemplateContext=catnip.useTemplateContext;
export const getChannelData=catnip.getChannelData;

export const addRoute=catnip.addRoute;
export const addTemplate=catnip.addTemplate;
export const getTemplateForRoute=catnip.getTemplateForRoute;
export const getPageComponentForRoute=catnip.getPageComponentForRoute;
