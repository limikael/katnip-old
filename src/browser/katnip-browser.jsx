import KatnipActions from "../lib/KatnipActions.js";
import ChannelManager from "./ChannelManager.js";
import ChannelConnector from "./ChannelConnector.js";
import {KatnipView} from "../components/KatnipView.jsx";
import {createContext, useContext} from "preact/compat";
import {pathMatch} from "../utils/path-match.js"; 
import {parseCookieString} from "../utils/js-util.js";
import {createElement, Fragment} from "react";

class BrowserKatnip {
	constructor() {
		this.actions=new KatnipActions();
		this.composeFunctions(this.actions);

		this.TemplateContext=createContext();

		this.channelManager=new ChannelManager();
		this.channelConnector=new ChannelConnector(this.channelManager);

		let channelTag=window.document.currentScript.dataset.channels;
		let initChannels=JSON.parse(channelTag);
		for (let k in initChannels) {
			this.channelManager.setChannelPersistence(k,true);
			this.channelManager.setChannelValue(k,initChannels[k]);
		}

		//console.log(initChannels);

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

	addElement=(tag, func, options)=> {
		if (typeof func!="string")
			func.options=options;

		this.elements[tag]=func;
	}

	clientMain=()=>{
		this.doAction("clientMain");

		let el=document.getElementById("katnip-root");
		render(<KatnipView />,el);
	}

	useCurrentUser=()=>{
		return this.doAction("useCurrentUser");
	}

	setCurrentUser=(userData)=>{
		this.doAction("setCurrentUser",userData);
	}

	getSessionId=()=>{
		let cookies=parseCookieString(document.cookie);
		return cookies.katnip;
	}

	renderElementContent=(node, options={})=>{
		if (typeof node=="string")
			return node.replace(/\s$/,"\u00A0").replace(/^\s/,"\u00A0");

		let element;
		if (Array.isArray(node)) {
			element=Fragment;
			node={props: {}, children: node};
		}

		else {
			element=this.elements[node.type];
			if (!element)
				throw new Error("Unknown type: "+node.type);
		}

		let children=[];
		if (node.children)
			for (let child of node.children)
				children.push(this.renderElementContent(child,options));

		if (!options.renderMode)
			options.renderMode="browser";

		let props={...node.props, renderMode: options.renderMode};

		return createElement(element,props,...children);
	}
}

const katnip=new BrowserKatnip();

export const elements=katnip.elements;
export const renderElementContent=katnip.renderElementContent;
export const TemplateContext=katnip.TemplateContext;

export const addElement=katnip.addElement;
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
export const setCurrentUser=katnip.setCurrentUser;

export const useChannel=katnip.channelManager.useChannel;
export const setChannelPersistence=katnip.channelManager.setChannelPersistence;
export const getChannelValue=katnip.channelManager.getChannelValue;
export const setChannelValue=katnip.channelManager.setChannelValue;
export const useWebSocketStatus=katnip.channelConnector.useWebSocketStatus;

export const getSessionId=katnip.getSessionId;