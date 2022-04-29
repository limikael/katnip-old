import {isClient, isServer} from "../utils/js-util.js";
import {useForceUpdate} from "../utils/react-util.jsx";
import {catnip, Model} from "catnip";

class Session extends Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		key: "VARCHAR(255) NOT NULL",
		value: "TEXT NOT NULL"
	}
}

export default class CatnipSessionManager {
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

			db.addModel(Session);
		}
	}

	useSession=()=>{
		if (isClient()) {
			let forceUpdate=useForceUpdate();

			return [
				this.clientSession,
				(newSession)=>{
					Object.assign(this.clientSession,newSession);
					forceUpdate();
				}
			]
		}

		if (isServer()) {
			if (!this.activeSessionId)
				throw new Error("No session");

			let sessionId=this.activeSessionId;

			return [
				this.sessions[sessionId],
				async (newSession)=>{
					Object.assign(this.sessions[sessionId],newSession);

					let session=await Session.findOne({key: sessionId});
					session.value=JSON.stringify(this.sessions[sessionId]);
					await session.save();
				}
			];
		}
	}

	withSession=async (sessionId, func)=>{
		if (!this.sessions[sessionId]) {
			this.sessions[sessionId]={};
			let session=new Session();
			session.key=sessionId;
			session.value=JSON.stringify({});
			await session.save();
		}

		this.activeSessionId=sessionId;
		let ret=func();
		this.activeSessionId=null;

		await ret;
	}

	isSession=(sessionId)=>{
		return !!this.sessions[sessionId];
	}

	load=async ()=>{
		for (let session of await Session.findMany()) 
			this.sessions[session.key]=JSON.parse(session.value);
	}
}