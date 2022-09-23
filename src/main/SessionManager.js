import Model from "../../packages/katnip-orm/src/Model.js";

class Session extends Model {
	static tableName="Session";

	static fields={
		id: "VARCHAR(255) NOT NULL PRIMARY KEY",
		value: "JSON"
	}
}

export default class SessionManager {
	constructor(katnip) {
		this.katnip=katnip;
		this.katnip.db.addModel(Session);
		this.sessions={};
	}

	getSessionValue=(sessionId)=>{
		if (!this.sessions[sessionId])
			return;

		return this.sessions[sessionId].value;
	}

	setSessionValue=async (sessionId, value)=>{
		if (!value) {
			if (this.sessions[sessionId]) {
				await this.sessions[sessionId].delete();
				delete this.sessions[sessionId];
			}

			return;
		}

		if (!this.sessions[sessionId])
			this.sessions[sessionId]=new Session({id: sessionId});

		this.sessions[sessionId].value=value;
		await this.sessions[sessionId].save();
	}

	loadSessions=async ()=>{
		for (let session of await Session.findMany()) 
			this.sessions[session.id]=session;
	}
}