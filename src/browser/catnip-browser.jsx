import CatnipActions from "../lib/CatnipActions.js";
//import CatnipSessionManager from "../lib/CatnipSessionManager.js";
import ChannelManager from "./ChannelManager.js";
import ChannelConnector from "./ChannelConnector.js";
import {CatnipView} from "../components/CatnipView.jsx";
import {createContext, useContext} from "preact/compat";
import {pathMatch} from "../utils/path-match.js"; 

class BrowserCatnip {
	constructor() {
		this.actions=new CatnipActions();
		this.composeFunctions(this.actions);

		this.TemplateContext=createContext();

		/*this.sessionManager=new CatnipSessionManager();
		this.composeFunctions(this.sessionManager);*/

		this.channelManager=new ChannelManager();
		this.channelConnector=new ChannelConnector(this.channelManager);

		let channelTag=window.document.currentScript.dataset.channels;
		let initChannels=JSON.parse(channelTag);
		for (let k in initChannels) {
			this.channelManager.setChannelPersistence(k,true);
			this.channelManager.setChannelValue(k,initChannels[k]);
		}

		console.log(initChannels);

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
		this.doActionAsync("clientMain");//,this.sessionManager.clientSession);

		let el=document.getElementById("catnip-root");
		render(<CatnipView />,el);
	}
}

const catnip=new BrowserCatnip();

export const elements=catnip.elements;
export const TemplateContext=catnip.TemplateContext;

export const addElement=catnip.addElement;
export const clientMain=catnip.clientMain;
export const addAction=catnip.addAction;
export const doAction=catnip.doAction;
export const doActionAsync=catnip.doActionAsync;
export const useTemplateContext=catnip.useTemplateContext;
export const addRoute=catnip.addRoute;
export const addTemplate=catnip.addTemplate;
export const getTemplateForRoute=catnip.getTemplateForRoute;
export const getPageComponentForRoute=catnip.getPageComponentForRoute;

export const useSession=catnip.useSession;
export const useChannel=catnip.channelManager.useChannel;
export const setChannelPersistence=catnip.channelManager.setChannelPersistence;
export const getChannelValue=catnip.channelManager.setChannelValue;
export const setChannelValue=catnip.channelManager.setChannelValue;
export const useWebSocketStatus=catnip.channelConnector.useWebSocketStatus;
