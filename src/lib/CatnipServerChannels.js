import EventEmitter from "events";
import {buildUrl, decodeQueryString} from "../utils/js-util.js";

export default class CatnipServerChannels extends EventEmitter {
	constructor() {
		super();
		this.channels={};
	}

	addChannel=(channelId, func)=>{
		this.channels[channelId]=func;
	}

	notifyChannel=(channelId, params={})=>{
		let channelUrl=buildUrl(channelId,params);

		this.emit("notification",channelUrl);
	}

	getChannelData=async (channelUrl, sessionReqeust)=>{
		let [channelId,queryString]=channelUrl.split("?");
		let query=decodeQueryString(queryString);

		return await this.channels[channelId](query, sessionReqeust);
	}
}