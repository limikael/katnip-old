import http from "http";

export default class MiddlewareServer {
	constructor() {
		this.server=http.createServer(this.handleRequest);
		this.middlewares=[];
	}

	use(middleware) {
		this.middlewares.push(middleware);
	}

	handleRequest=(req, res)=>{
		let nextIndex=0;

		let next=(maybeReq)=>{
			if (maybeReq)
				req=maybeReq;

			let thisIndex=nextIndex;
			nextIndex++;

			if (!this.middlewares[thisIndex]) {
				throw new Error("No more middlewares");
				return;
			}

			let mw=this.middlewares[thisIndex];
			if (mw.handleRequest)
				mw.handleRequest(req, res, next);

			else
				mw(req, res, next);
		}

		next();
	}

	listen(port, ip) {
		return new Promise((resolve,reject)=>{
			this.server.listen(port,ip,()=>{
				resolve();
			});
		});
	}
}