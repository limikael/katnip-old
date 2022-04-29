export default class CatnipActions {
	constructor() {
		this.actions={};
	}

	addAction=(action, fn)=>{
		if (!this.actions[action])
			this.actions[action]=[];

		this.actions[action].push(fn);
	}

	doAction=(action, ...params)=>{
		if (!this.actions[action])
			return;

		let ret;
		for (let fn of this.actions[action]) {
			let v=fn(...params);
			if (v!==undefined)
				ret=v;
		}

		return ret;
	}

	doActionAsync=async (action, ...params)=>{
		if (!this.actions[action])
			return;

		let promises=[];
		for (let fn of this.actions[action])
			promises.push(fn(...params));

		let results=await Promise.all(promises);

		let ret;
		for (let result of results)
			if (result!==undefined)
				ret=result;

		return ret;
	}
}
