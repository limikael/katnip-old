import EventEmitter from "events";

export default class ChannelData extends EventEmitter {
	constructor(channelId) {
		//console.log("id: "+channelId);
		super();

		this.id=channelId;
		this.persistent=false;
		this.ref=0;

		this.setMaxListeners(20);
	}

	setValue=(value)=>{
		this.value=value;
		this.emit("change",this.id);
	}

	getValue=()=>{
		return this.value;
	}

	setPersistence(persistent) {
		this.persistent=persistent;
		this.checkFinalize();
	}

	incRef=()=>{
		this.ref++;
	}

	decRef=()=>{
		if (this.ref<=0) {
			console.log("Channel minus ref");
			return;
		}

		this.ref--;
		this.checkFinalize();
	}

	clearRef=()=>{
		this.removeAllListeners("change");
		this.ref=0;
		this.checkFinalize();
	}

	checkFinalize=()=>{
		if (!this.ref && !this.persistent)
			this.emit("finalize",this.id);
	}
}