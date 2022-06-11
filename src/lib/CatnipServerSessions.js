import Model from "../orm/Model.js";

class Session extends Model {
	static tableName="Session";

	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		cookie: "VARCHAR(255) NOT NULL",
		userId: "INTEGER"
	}
}

export default class CatnipServerSessions {
	constructor(catnip) {
		this.catnip=catnip;
		this.catnip.db.addModel(Session);
		this.sessions={};
	}

	getUserIdByCookie=(cookie)=>{
		return this.sessions[cookie];
	}

	initSessionRequest=async (cookie)=>{
		let sessionRequest={};

		sessionRequest.cookie=cookie;
		sessionRequest.uid=this.sessions[cookie];
		sessionRequest.getUserId=()=>{
			return sessionRequest.uid;
		}
		sessionRequest.setUserId=async (uid)=>{
			await this.setSessionUserId(cookie,uid);
			await this.catnip.doActionAsync("initSessionRequest",sessionRequest);
		}

		await this.catnip.doActionAsync("initSessionRequest",sessionRequest);

		return sessionRequest;
	}

	setSessionUserId=async (cookie, userId)=>{
		this.sessions[cookie]=userId;

		let session=await Session.findOne({cookie: cookie});
		if (!session) {
			session=new Session();
			session.cookie=cookie;
		}

		session.userId=userId;
		await session.save();
	}

	loadSessions=async ()=>{
		for (let session of await Session.findMany()) 
			this.sessions[session.cookie]=session.userId;
	}
}