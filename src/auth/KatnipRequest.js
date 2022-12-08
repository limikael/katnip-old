import {getCapsByRole, getRoles} from "./rolecaps.js";
import {parseCookieString} from "../utils/js-util.js";

/**
 * A request for a url.
 *
 * This class is used both on the server and the client to
 * represent information related to a request for a HTTP resource.
 * It is similar, but not exactly the same, as the standard request object for
 * Node.js and libraries like express.js. It is also bit similar to the URL
 * class.
 *
 * On the client, an instance of this class is passed to the current route,
 * as added with the `addRoute` function.
 *
 * On the server, an instance of this class is passed as the second parameter
 * for api and channel handler functions, as registered with the `addApi` and 
 * `addChannel` functions.
 *
 * @class Request
 * @param query:Object Object containing the query parameters of the request
 *                     and values for the Request.
 * @param pathargs:Array Array containing the parts of the path, split by /.
 * @param pathname:String The path of the request.
 * @param href:String The full absolute url of the request.
 * @param url:String Local url of the request, i.e. the pathname and query.
 * @param origin:String The protocol, server and port part of the url.
 */
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

	/**
	 * Checks if the user who made the request has a certain capability.
	 *
	 * This function will return `true` or `false` depending on the
	 * capability of the current user.
	 *
	 * @function Request.currentUserCan
	 * @param cap:String Capability to check for.
	 */
	currentUserCan(cap) {
		if (!this.user)
			return false;

		return getCapsByRole(this.user.role).includes(cap);
	}

	/**
	 * Asserts that the user who made the request has a certain capability.
	 *
	 * If the current user does not have the capability specified, this function
	 * will throw an exception.
	 *
	 * @function Request.assertCap
	 * @param cap:String Capability to check for.
	 */
	assertCap(cap) {
		if (!this.currentUserCan(cap))
			throw new Error("Not authorized.");
	}

	/**
	 * Get the user who made the request.
	 *
	 * @function Request.getUser
	 */
	getUser() {
		return this.user;
	}
}