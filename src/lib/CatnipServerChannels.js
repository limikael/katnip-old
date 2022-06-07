import EventEmitter from "events";
import {buildUrl, decodeQueryString} from "../utils/js-util.js";

export default class CatnipServerChannels extends EventEmitter {
	constructor(catnip) {
		super();

		this.catnip=catnip;
		this.channels={};
	}

	addChannel=(channelId, func)=>{
		this.catnip.assertFreeName(channelId);
		this.channels[channelId]=func;
	}

	notifyChannel=(channelId, params={})=>{
		let channelUrl=buildUrl(channelId,params);

		this.emit("notification",channelUrl);
	}

	getChannelData=async (channelUrl, sessionReqeust)=>{
		let [channelId,queryString]=channelUrl.split("?");
		let query=decodeQueryString(queryString);

		let settings=this.catnip.getSettings({id: channelId});
		if (settings.length) {
			let setting=settings[0];

			if (!setting.session)
				throw new Error("Setting not available as channel");

			return setting.value;
		}

		if (!this.channels[channelId])
			throw new Error("No such channel: "+channelId);

		return await this.channels[channelId](query, sessionReqeust);
	}

	assertFreeName=(name)=>{
		if (this.channels[name])
			throw new Error("Already a channel: "+name);
	}
}