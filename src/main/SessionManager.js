import Model from "../orm/Model.js";

class Session extends Model {
	static tableName="Session";

	static fields={
		id: "VARCHAR(255) NOT NULL",
		value: "JSON"
	}
}

export default class SessionManager {
	constructor(catnip) {
		this.catnip=catnip;
		this.catnip.db.addModel(Session);
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