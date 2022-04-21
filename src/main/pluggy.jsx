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
			this.sessions={};
		}

		if (this.isClient()) {
			let sessionTag=window.document.currentScript.dataset.session;

			if (sessionTag)
				this.session=JSON.parse(sessionTag);

			else
				this.session={};
		}

		this.elements={};
	}

	addElement(tag, func) {
		this.elements[tag]=func;
	}

	setActiveSessionId(id) {
		if (!id) {
			this.activeSessionId=null;
			return;
		}

		this.activeSessionId=id;

		if (!this.sessions[this.activeSessionId])
			this.sessions[this.activeSessionId]={};
	}

	getActiveSessionId() {
		return this.activeSessionId;
	}

	useSession() {
		if (this.isClient()) {
			return [
				this.session,
				(newSession)=>{
					Object.assign(this.session,newSession);
					this.refreshClient()
				}
			]
		}

		if (this.isServer()) {
			if (!this.activeSessionId)
				throw new Error("No session");

			let sessionId=this.activeSessionId;

			return [
				this.sessions[sessionId],
				(newSession)=>{
					Object.assign(this.sessions[sessionId],newSession);
				}
			];
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

	doActionAsync=async (action, ...params)=>{
		if (!this.actions[action])
			return;

		let sessionId=this.getActiveSessionId();

		let ret;
		for (let fn of this.actions[action]) {
			this.setActiveSessionId(sessionId);
			let v=await fn(...params);
			if (v!==undefined)
				ret=v;
		}

		return ret;
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
export const getCurrentRequest=pluggy.getCurrentRequest;
export const isServer=pluggy.isServer;
export const isClient=pluggy.isClient;
export const clientMain=pluggy.clientMain;
export const serverMain=pluggy.serverMain;
export const setActiveSessionId=pluggy.setActiveSessionId;
export const getActiveSessionId=pluggy.getActiveSessionId;
export const useSession=pluggy.useSession;
export const addElement=pluggy.addElement;
