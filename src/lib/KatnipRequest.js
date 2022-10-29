import {parseCookieString} from "../utils/js-util.js";

export default class KatnipRequest {
	constructor() {
	}

	matchPath() {
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

	processNodeRequestOrigin(request) {
		this.protocol="http";
		if (request.headers["x-forwarded-proto"])
			this.protocol=request.headers["x-forwarded-proto"].split(",")[0];

		this.origin=this.protocol+"://"+request.headers.host;
	}

	processCookieString(cookieString) {
		this.cookies=parseCookieString(cookieString);
	}

	processNodeRequest(request) {
		this.processNodeRequestOrigin(request);
		this.processUrl(request.url);
		this.processCookieString(request.headers.cookie);

		this.headers=request.headers;

		this.sessionId=this.cookies.katnip;
		if (!this.sessionId)
			this.sessionId=nodeCrypto.randomUUID();
	}

	async processNodeRequestBody(request) {
		const buffers = [];
		for await (const chunk of request)
			buffers.push(chunk);

		let body=Buffer.concat(buffers);
		if (body.length) {
			let bodyQuery=JSON.parse(body);
			Object.assign(this.query,bodyQuery);
		}
	}

	processBrowserDocument() {
		this.processUrl(window.location);
		this.processCookieString(window.document.cookie)
		this.sessionId=this.cookies.katnip;
	}
}