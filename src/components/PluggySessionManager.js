import {isClient, isServer} from "../utils/web-util.js";
import {pluggy} from "pluggy";

export default class PluggySessionManager {
	constructor(db) {
		if (isClient()) {
			let sessionTag=window.document.currentScript.dataset.session;

			if (sessionTag)
				this.clientSession=JSON.parse(sessionTag);

			else
				this.clientSession={};
		}

		if (isServer()) {
			this.sessions={};
		}
	}

	useSession=()=>{
		if (isClient()) {
			return [
				this.clientSession,
				(newSession)=>{
					Object.assign(this.clientSession,newSession);
					pluggy.refreshClient()
				}
			]
		}

		if (isServer()) {
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

	setActiveSessionId=(id)=>{
		if (!id) {
			this.activeSessionId=null;
			return;
		}

		this.activeSessionId=id;

		if (!this.sessions[this.activeSessionId])
			this.sessions[this.activeSessionId]={};
	}

	getActiveSessionId=()=>{
		return this.activeSessionId;
	}
}