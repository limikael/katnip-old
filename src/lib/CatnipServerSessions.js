import Model from "../orm/Model.js";

class Session extends Model {
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

	initSessionRequest=async (cookie)=>{
		let sessionRequest={};

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

/*		}

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

*/