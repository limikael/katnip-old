import EventEmitter from "events";
import ChannelData from "./ChannelData.js";
import {useEventUpdate, useImmediateEffect} from "../utils/react-util.jsx";

export default class ChannelManager extends EventEmitter {
	constructor() {
		super();

		this.channelData={};
	}

	setChannelValue=(channelId, value)=>{
		console.log("set chan val: "+channelId+"="+value);
		if (!this.channelData[channelId])
			return;

		this.channelData[channelId].setValue(value);
	}

	getChannelValue=(channelId)=>{
		if (!this.channelData[channelId])
			return;

		return this.channelData[channelId].getValue();
	}

	softCreateChannel=(channelId)=>{
		if (!this.channelData[channelId]) {
			this.channelData[channelId]=new ChannelData(channelId);
			this.channelData[channelId].on("finalize",this.onChannelFinalize);
			this.emit("newChannel",channelId);
		}
	}

	onChannelFinalize=(channelId)=>{
		delete this.channelData[channelId];
		this.emit("deleteChannel",channelId);
	}

	useChannel=(channelId, dontUse)=>{
		useImmediateEffect(()=>{
			this.softCreateChannel(channelId);
			this.channelData[channelId].incRef();

			return ()=>{
				this.channelData[channelId].decRef();
			}
		},[channelId]);

		useEventUpdate("change",this.channelData[channelId]);

		if (dontUse)
			throw new Error("don't use this param");

		return this.channelData[channelId].getValue();
	}

	setChannelPersistence=(channelId, persistence)=>{
		this.softCreateChannel(channelId);
		this.channelData[channelId].setPersistence(persistence);
	}

	clearNonPersistent=()=>{
		for (let channelId in this.channelData) {
			let channelData=this.channelData[channelId];
			if (!channelData.persistent)
				channelData.setValue();
		}
	}

	getChannelIds=()=>{
		return Object.keys(this.channelData);
	}
}