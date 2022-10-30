import KatnipActions from "../lib/KatnipActions.js";
import ChannelManager from "./ChannelManager.js";
import ChannelConnector from "./ChannelConnector.js";
import {KatnipView} from "../components/KatnipView.jsx";
import {createContext, useContext} from "preact/compat";
import {pathMatch} from "../utils/path-match.js"; 
import {parseCookieString, buildUrl} from "../utils/js-util.js";
import {createElement, Fragment} from "react";
import ContentRenderer from "../richedit/ContentRenderer.jsx";

class BrowserKatnip {
	constructor() {
		this.actions=new KatnipActions();
		this.composeFunctions(this.actions);

		this.TemplateContext=createContext();

		this.channelManager=new ChannelManager();
		this.channelConnector=new ChannelConnector(this.channelManager);
		this.contentRenderer=new ContentRenderer();

		let channelTag=window.document.currentScript.dataset.channels;
		let initChannels=JSON.parse(channelTag);
		for (let k in initChannels) {
			this.channelManager.setChannelPersistence(k,true);
			this.channelManager.setChannelValue(k,initChannels[k]);
		}

		this.templates={};
		this.routes={};

		window.apiFetchDefaultOptions={
			processResult: this.processApiFetchResult
		}
	}

	processApiFetchResult=(data, response)=>{
		if (response.headers.get("X-Katnip-Type")=="wrapped") {
			for (let k in data.channelValues)
				this.channelManager.setChannelValue(k,data.channelValues[k]);

			data=data.result;
		}

		return data;
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

	clientMain=()=>{
		this.doAction("clientMain");

		let el=document.getElementById("katnip-root");
		render(<KatnipView />,el);
	}

	useCurrentUser=()=>{
		let cookies=parseCookieString(document.cookie);
		let sessionId=cookies.katnip;
		let channelId=buildUrl("user",{sessionId: sessionId});

		return this.channelManager.useChannel(channelId);
	}

	getCurrentUser=()=>{
		let cookies=parseCookieString(document.cookie);
		let sessionId=cookies.katnip;
		let channelId=buildUrl("user",{sessionId: sessionId});

		return this.channelManager.getChannelValue(channelId);
	}
}

const katnip=new BrowserKatnip();

export const contentRenderer=katnip.contentRenderer;
export const addElement=katnip.contentRenderer.addElement;
export const renderNode=katnip.contentRenderer.renderNode;
export const renderFragment=katnip.contentRenderer.renderFragment;
export const elements=katnip.contentRenderer.elements;

export const TemplateContext=katnip.TemplateContext;

export const clientMain=katnip.clientMain;
export const addAction=katnip.addAction;
export const doAction=katnip.doAction;
export const doActionAsync=katnip.doActionAsync;
export const useTemplateContext=katnip.useTemplateContext;
export const addRoute=katnip.addRoute;
export const addTemplate=katnip.addTemplate;
export const getTemplateForRoute=katnip.getTemplateForRoute;
export const getPageComponentForRoute=katnip.getPageComponentForRoute;

export const useCurrentUser=katnip.useCurrentUser;
export const getCurrentUser=katnip.getCurrentUser;
export const setCurrentUser=null;

export const useChannel=katnip.channelManager.useChannel;
export const setChannelPersistence=katnip.channelManager.setChannelPersistence;
export const getChannelValue=katnip.channelManager.getChannelValue;
export const setChannelValue=katnip.channelManager.setChannelValue;
export const useWebSocketStatus=katnip.channelConnector.useWebSocketStatus;

//export const getSessionId=katnip.getSessionId;