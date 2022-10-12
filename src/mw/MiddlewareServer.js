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

	close() {
		if (this.server)
			this.server.close();
	}

	listen(...args) {
		return new Promise((resolve,reject)=>{
			if (args.length==1)
				this.server.listen(args[0],()=>{
					resolve();
				});

			else if (args.length==2)
				this.server.listen(args[0],args[1],()=>{
					resolve();
				});

			else
				throw new Error("Bad args for listen");
		});
	}
}