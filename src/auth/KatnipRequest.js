import {getCapsByRole, getRoles} from "./rolecaps.js";
import {parseCookieString} from "../utils/js-util.js";

export default class KatnipRequest {
	constructor() {
	}

	processUrl(url) {
		let l=new URL(url,this.origin);
		this.query=Object.fromEntries(new URLSearchParams(l.search));
		this.pathargs=l.pathname.split("/").filter(s=>s.length>0);
		this.pathname="/"+this.pathargs.join("/");
		this.href=l.href;
		this.url=l.pathname+l.search;
		this.origin=l.origin;
	}

	processCookieString(cookieString) {
		this.cookies=parseCookieString(cookieString);
	}

	currentUserCan(cap) {
		if (!this.user)
			return false;

		return getCapsByRole(this.user.role).includes(cap);
	}

	assertCap(cap) {
		if (!this.currentUserCan(cap))
			throw new Error("Not authorized.");
	}

	getUser() {
		return this.user;
	}
}