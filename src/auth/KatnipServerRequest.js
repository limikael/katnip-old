import nodeCrypto from "crypto";
import User from "./User.js";
import KatnipRequest from "./KatnipRequest.js";
import {buildUrl} from "../utils/js-util.js";
import formidable from "formidable";

export default class KatnipServerRequest extends KatnipRequest {
	constructor(katnip, nodeReq) {
		super();
		this.katnip=katnip;

		this.processNodeRequestOrigin(nodeReq);
		this.processUrl(nodeReq.url);
		this.processCookieString(nodeReq.headers.cookie);

		this.headers=nodeReq.headers;

		this.sessionId=this.cookies.katnip;
		if (!this.sessionId)
			this.sessionId=nodeCrypto.randomUUID();

		this.piggybackedChannels=[];
	}

	/**
	 * Piggyback channel value on the request.
	 *
	 * This function will piggyback the value for channel on the request.
	 * This means that if a request handler on the server modifies the value
	 * of a channel, the client can rely on the value of the channel to have
	 * been updated when the apiFetch returns.
	 *
	 * @function Request.piggybackChannel
	 * @param channelId:String The channel to piggyback.
	 */
	piggybackChannel(channelId) {
		this.piggybackedChannels.push(channelId);
	}

	processNodeRequestOrigin(nodeReq) {
		this.protocol="http";
		if (nodeReq.headers["x-forwarded-proto"])
			this.protocol=nodeReq.headers["x-forwarded-proto"].split(",")[0];

		this.origin=this.protocol+"://"+nodeReq.headers.host;
	}

	async processNodeRequestBody(nodeReq) {
		let form=new formidable.IncomingForm();
		await new Promise((resolve, reject)=>{
			form.parse(nodeReq, (err, fields, files)=>{
				if (err) {
					reject(err);
					return;
				}

				this.query={...fields, ...files};
				resolve();
			});
		});
	}

	async initUserFromSession() {
		this.user=null;

		let uid=this.katnip.sessionManager.getSessionValue(this.sessionId);
		if (uid) {
			this.user=await User.findOne(uid);
			if (this.user)
				await this.user.populateAuthMethods();
		}
	}

	/**
	 * Set user for the session related to the request.
	 *
	 * Use this function to log in or out a user.
	 * This function is only available on the server.
	 *
	 * @function async Request.setUser
	 * @param user:User The user to set.
	 */
	async setUser(user) {
		if (user && !user.id)
			throw new Error("Can't set user without id");

		this.user=user;

		let userId=null;
		if (this.user)
			userId=this.user.id;

		await this.katnip.sessionManager.setSessionValue(this.sessionId,userId);

		let channelId=buildUrl("user",{sessionId: this.sessionId});
		await this.katnip.serverChannels.notifyChannel(channelId);

		this.piggybackChannel(channelId);
	}
}