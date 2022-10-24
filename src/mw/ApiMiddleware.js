export default class ApiMiddleware {
	constructor() {
		this.methods={};
	}

	addApiMethod(url, func) {
		this.methods[url]=func;
	}

	handleRequest=async (req, res, next)=>{
		let func=this.methods[req.pathname];
		if (func) {
			try {
				let data=await func(req.query,req);

				res.writeHead(200);
				if (!data)
					data=null;
				res.end(JSON.stringify(data));
				return;
			}

			catch (e) {
				console.log("** Api call failed...");
				console.log(e);
				res.writeHead(500);
				res.end(JSON.stringify({
					message: e.message
				}));
				return;
			}
		}

		else
			next();
	}
}