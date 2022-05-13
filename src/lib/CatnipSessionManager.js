import {isClient, isServer} from "../utils/js-util.js";
import {useForceUpdate} from "../utils/react-util.jsx";
import Model from "../orm/Model.js";

export default class CatnipSessionManager {
	constructor() {
		if (!isClient())
			throw new Error("This is a client thing");

		let sessionTag=window.document.currentScript.dataset.session;

		if (sessionTag)
			this.clientSession=JSON.parse(sessionTag);

		else
			this.clientSession={};
	}

	useSession=()=>{
		let forceUpdate=useForceUpdate();

		return [
			this.clientSession,
			(newSession)=>{
				Object.assign(this.clientSession,newSession);
				forceUpdate();
			}
		]
	}
}