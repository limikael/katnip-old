export default class ExpiringMap {
	constructor(lifeTime) {
		this.lifeTime=lifeTime;
		this.values=new Map();
	}

	set(key, value) {
		if (value)
			this.values.set(key,{
				value: value,
				accessTime: Date.now()
			});

		else
			this.values.delete(key);

		this.installInterval();
	}

	get(key) {
		if (this.values.get(key))
			return this.values.get(key).value;
	}

	onInterval=()=>{
		let now=Date.now();
		for (let key of this.values.keys()) {
			if (now>this.values.get(key).accessTime+this.lifeTime)
				this.values.delete(key);
		}

		this.installInterval();
	}

	installInterval() {
		if (this.values.size) {
			if (!this.interval) {
				this.interval=setInterval(this.onInterval,this.lifeTime);
			}
		}

		else {
			if (this.interval) {
				clearInterval(this.interval);
				this.interval=null;
			}
		}
	}
}