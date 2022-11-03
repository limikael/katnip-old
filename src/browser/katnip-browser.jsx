import Actions from "../utils/Actions.js";
import EventEmitter from "events";
import ChannelManager from "./ChannelManager.js";
import ChannelConnector from "./ChannelConnector.js";
import {KatnipView, KatnipRequestView} from "../components/KatnipView.jsx";
import {pathMatch} from "../utils/path-match.js";
import {parseCookieString, buildUrl, fetchEx} from "../utils/js-util.js";
import {useEventUpdate} from "../utils/react-util.jsx";
import {createElement, Fragment} from "react";
import ContentRenderer from "../richedit/ContentRenderer.jsx";
import {render as renderToString} from "preact-render-to-string";

class BrowserKatnip {
	constructor() {
		this.actions=new Actions();
		this.emitter=new EventEmitter();

		this.channelManager=new ChannelManager();
		this.channelConnector=new ChannelConnector(this.channelManager);
		this.contentRenderer=new ContentRenderer();

		this.templateContext={};
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
		useEventUpdate(this.emitter,"templateContextChange")
		return this.templateContext;
	}

	setTemplateContext=(vals, second)=>{
		if (typeof vals=="string") {
			let o={};
			o[vals]=second
			vals=o;
		}

		for (let k in vals)
			this.templateContext[k]=vals[k];

		this.emitter.emit("templateContextChange");
	}

	clearTemplateContext=()=>{
		this.templateContext={};
		this.emitter.emit("templateContextChange");
	}

	clientMain=(options)=>{
		console.log("client main");
		this.channelConnector.initWebSocket();

		let initChannels=options.initChannels;
		for (let k in initChannels) {
			this.channelManager.setChannelPersistence(k,true);
			this.channelManager.setChannelValue(k,initChannels[k]);
		}

		if (document.getElementById("katnip-ssr")) {
			let rootEl=document.getElementById("katnip-root");
			rootEl.style.display="none";
		}

		this.actions.doAction("clientMain");

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

	processApiFetchResult=(data, response)=>{
		if (response.headers.get("X-Katnip-Type")=="wrapped") {
			for (let k in data.channelValues)
				this.channelManager.setChannelValue(k,data.channelValues[k]);

			data=data.result;
		}

		return data;
	}

	apiFetch=(url, query={}, options={})=>{
		if (this.ssr && this.ssr.pass==1) {
			this.ssr.apiCalls[buildUrl(url,query)]={
				url, query, ...options
			};
			return;
		}

		if (this.ssr && this.ssr.pass==2) {
			let res=this.ssr.apiCalls[buildUrl(url,query)].result;

			return res;
		}

		let o={
			...options,
			query: query,
			processResult: this.processApiFetchResult
		};

		return fetchEx(url,o);
	};

	useChannel=(channelId, dontUse)=>{
		if (this.ssr)
			return this.channelManager.getChannelValue(channelId);

		return this.channelManager.useChannel(channelId,dontUse);
	}

	initSsrChannels=()=>{
		for (let k in this.ssr.channels) {
			this.channelManager.setChannelPersistence(k,true);
			this.channelManager.setChannelValue(k,this.ssr.channels[k]);
		}
	}

	ssrPassOne=(req, ssr)=>{
		this.ssr=ssr;
		this.ssr.pass=1;
		this.initSsrChannels();

		this.ssr.apiCalls={};
		renderToString(<KatnipRequestView request={req}/>);
		this.channelManager.clearRef();
		this.channelConnector.removeAllListeners();
		this.emitter.removeAllListeners();

		this.ssr=null;
	}

	ssrPassTwo=(req, ssr)=>{
		this.ssr=ssr;
		this.ssr.pass=2;
		this.initSsrChannels();

		this.templateContext={};
		let res=renderToString(<KatnipRequestView request={req}/>);
		res=renderToString(<KatnipRequestView request={req}/>);
		this.channelManager.clearRef();
		this.channelConnector.removeAllListeners();
		this.emitter.removeAllListeners();

		this.ssr=null;
		return res;
	}
}

const katnip=new BrowserKatnip();

export const ssrPassOne=katnip.ssrPassOne;
export const ssrPassTwo=katnip.ssrPassTwo;
export const apiFetch=katnip.apiFetch;

export const contentRenderer=katnip.contentRenderer;
export const addElement=katnip.contentRenderer.addElement;
export const renderNode=katnip.contentRenderer.renderNode;
export const renderFragment=katnip.contentRenderer.renderFragment;
export const elements=katnip.contentRenderer.elements;

export const TemplateContext=katnip.TemplateContext;

export const clientMain=katnip.clientMain;
export const addAction=katnip.actions.addAction;
export const doAction=katnip.actions.doAction;
export const doActionAsync=katnip.actions.doActionAsync;
export const useTemplateContext=katnip.useTemplateContext;
export const setTemplateContext=katnip.setTemplateContext;
export const clearTemplateContext=katnip.clearTemplateContext;
export const addRoute=katnip.addRoute;
export const addTemplate=katnip.addTemplate;
export const getTemplateForRoute=katnip.getTemplateForRoute;
export const getPageComponentForRoute=katnip.getPageComponentForRoute;

export const useCurrentUser=katnip.useCurrentUser;
export const getCurrentUser=katnip.getCurrentUser;

export const useChannel=katnip.useChannel;
export const setChannelPersistence=katnip.channelManager.setChannelPersistence;
export const getChannelValue=katnip.channelManager.getChannelValue;
export const setChannelValue=katnip.channelManager.setChannelValue;
export const useWebSocketStatus=katnip.channelConnector.useWebSocketStatus;
