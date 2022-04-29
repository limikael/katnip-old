import EventEmitter from "events";

export default class CatnipServerChannels extends EventEmitter {
	constructor() {
		super();
		this.channels={};
	}

	addChannel=(channelId, func)=>{
		this.channels[channelId]=func;
	}

	notifyChannel=(channelId)=>{
		this.emit("notification",channelId);
	}

	getChannelData=async (channelId)=>{
		return await this.channels[channelId]();
	}
}