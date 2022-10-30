import KatnipRequest from "./KatnipRequest.js";

export default class KatnipClientRequest extends KatnipRequest {
	constructor() {
		super();

		this.processUrl(window.location);
		this.processCookieString(window.document.cookie)
		this.sessionId=this.cookies.katnip;
	}
}