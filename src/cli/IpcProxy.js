export default class IpcProxy {
	constructor(process, expose) {
		this.process=process;
		this.process.on("message",this.onMessage);
		this.expose=expose;

		this.nextCallId=1;
		this.promisesByCallId={};

		let that=this;
		this.proxy=new Proxy({},{
			get(target, prop, receiver) {
				return async (...args)=>{
					return await that.callProcess(prop,...args);
				}
			}
		});
	}

	onMessage=async (message, handle)=>{
		switch (message.type) {
			case "call":
				let res=await this.expose[message.call](...message.args);
				this.process.send({
					"type": "response",
					"value": res,
					"id": message.id
				}, res);
				break;

			case "response":
				let p=this.promisesByCallId[message.id];
				delete this.promisesByCallId[message.id];

				if (handle)
					p.resolve(handle);

				else
					p.resolve(message.value);
				break;

			default:
				throw new Error("unknown message type: "+message.type);
		}
	}

	callProcess(call, ...args) {
		let id=this.nextCallId;
		this.nextCallId++;

		return new Promise((resolve, reject)=>{
			this.promisesByCallId[id]={resolve,reject};
			this.process.send({
				"type": "call",
				"call": call, 
				"args": args,
				"id": id
			});
		});		
	}
}
