export default class CatnipRequest {
	constructor(data) {
		for (let k in data)
			this[k]=data[k];

/*		this.pathname="";
		this.pathargs=[];
		this.query="";
		this.origin="";
		this.href="";
		this.cookies="";
		this.sessionId*/
	}

	matchPath() {

	}

	static parseCookies(request) {
		const list = {};
		const cookieHeader = request.headers?.cookie;
		if (!cookieHeader) return list;

		cookieHeader.split(`;`).forEach(function(cookie) {
			let [ name, ...rest] = cookie.split(`=`);
			name = name?.trim();
			if (!name) return;
			const value = rest.join(`=`).trim();
			if (!value) return;
			list[name] = decodeURIComponent(value);
		});

		return list;
	}

	static async fromNodeRequest(req) {
		let protocol="http";
		if (req.headers["x-forwarded-proto"])
			protocol=req.headers["x-forwarded-proto"];

		let origin=protocol+"://"+req.headers.host;

		let l=new URL(req.url,origin);
		let query=Object.fromEntries(new URLSearchParams(l.search));
		let pathargs=l.pathname.split("/").filter(s=>s.length>0);
		let pathname="/"+pathargs.join("/");

		let url=req.url;
		let href=origin+url;

		let cookies=CatnipRequest.parseCookies(req);

		let sessionId=cookies.catnip;
		if (!sessionId)
			sessionId=crypto.randomUUID();

		return new CatnipRequest({
			origin,query,pathargs,pathname,url,href,cookies,sessionId
		});
	}

	static fromBrowserLocation() {
		
	}
}