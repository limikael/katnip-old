import Model from "../orm/Model.js";

class Session extends Model {
	static tableName="Session";

	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		cookie: "VARCHAR(255) NOT NULL",
		value: {type: "json"}
	}
}

export default class SessionManager {
	constructor(catnip) {
		this.catnip=catnip;
		this.catnip.db.addModel(Session);
		this.sessions={};
	}

	getSessionValue=(sessionId)=>{
		return this.sessions[sessionId];
	}

	setSessionValue=async (sessionId, value)=>{
		this.sessions[sessionId]=value;

		let session=await Session.findOne({cookie: sessionId});
		if (!session) {
			session=new Session();
			session.cookie=sessionId;
		}

		session.value=value;
		await session.save();
	}

	loadSessions=async ()=>{
		for (let session of await Session.findMany()) 
			this.sessions[session.cookie]=session.value;
	}
}