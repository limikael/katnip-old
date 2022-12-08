export default class Actions {
	constructor() {
		this.actions={};
	}

	/**
	 * Add a listener for an action.
	 *
	 * @function Common Functions.addAction
	 * @param action:String The action to listen to.
	 * @param fn:Function The function to be called when the action
	 *                    triggers.
	 */
	addAction=(action, fn)=>{
		if (!this.actions[action])
			this.actions[action]=[];

		this.actions[action].push(fn);
	}

	/**
	 * Call action callbacks.
	 *
	 * This function calls the registered handlers for the specified
	 * action.
	 *
	 * @function Common Functions.doAction
	 * @param action:String The action to trigger.
	 * @param ...params Parameters to be passed to the action handler.
	 */
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

	/**
	 * Call action callbacks.
	 *
	 * This function calls the registered handlers for the specified
	 * action. The action handlers are expected to return a Promise
	 * and this function will wait for all action handlers to complete.
	 *
	 * @function async Common Functions.doActionAsync
	 * @param action:String The action to trigger.
	 * @param ...params Parameters to be passed to the action handler.
	 */
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
