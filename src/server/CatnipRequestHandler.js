import {v4 as uuidv4} from 'uuid';
import {quoteAttr, delay} from "../utils/js-util.js";
import {getPluginPaths} from "./catnip-server-util.js";
import fs from "fs";

export default class CatnipRequestHandler {
	constructor(catnip, options) {
		this.catnip=catnip;
		this.options=options;
	}

	setClientBundle(bundle) {
		this.clientBundle=bundle;
	}

	handlePublic=(req, res)=> {
		let pluginPaths=getPluginPaths();

		for (let pluginName in pluginPaths) {
			let cand=pluginPaths[pluginName]+"/"+req.url;

			if (fs.existsSync(cand)) {
				res.writeHead(200);
				res.end(fs.readFileSync(cand));
				return;
			}
		}

		res.writeHead(404);
		res.end("Not found...");
	}

	handleApi=async (req, res, sessionCookie)=>{
		if (this.options.apidelay)
			await delay(1000);

		const buffers = [];
		for await (const chunk of req)
			buffers.push(chunk);

		let bodyQuery={};
		if (Buffer.concat(buffers).length)
			bodyQuery=JSON.parse(Buffer.concat(buffers));

		let l=new URL(req.url,"http://example.com");
		let query=Object.fromEntries(new URLSearchParams(l.search));
		Object.assign(query,bodyQuery);
		let params=l.pathname.split("/").filter(s=>s.length>0);
		let path="/"+params.join("/");

		/*if (params.length!=2) {
			res.writeHead(404);
			res.end("Malformed...");
			return;
		}*/

		let func=this.catnip.apis[path];
		if (func) {
			try {
				let sessionRequest=await catnip.initSessionRequest(sessionCookie);
				let data=await func(query,sessionRequest);

				res.writeHead(200);
				if (!data)
					data=null;
				res.end(JSON.stringify(data));
				return;
			}

			catch (e) {
				console.log(e);
				res.writeHead(500);
				res.end(JSON.stringify({
					message: e.message
				}));
				return;
			}
		}

		res.writeHead(404);
		res.end(JSON.stringify({
			message: "Not found......."
		}));
	}

	handleRequest=async (req, res)=>{
		let cookies=this.catnip.parseCookies(req);
		if (!cookies.catnip)
			cookies.catnip=uuidv4();

		try {
			if (req.url=="/catnip-bundle.js") {
				res.writeHead(200);
				res.end(this.clientBundle);
			}

			else if (req.url.startsWith("/api/")) {
				await this.handleApi(req,res,cookies.catnip);
			}

			else if (req.url.startsWith("/public/"))
				this.handlePublic(req,res);

			else {
				(async()=>{
					let clientSession={};
					let sessionRequest=await catnip.initSessionRequest(cookies.catnip);
					await this.catnip.doActionAsync("getClientSession",clientSession,sessionRequest);

					res.writeHead(200,{
						"Set-Cookie": `catnip=${cookies.catnip}`
					});

					let quotedSession=quoteAttr(JSON.stringify(clientSession));

					let clientPage=`<body><html>`;
					clientPage+=`<div id="catnip-root"></div>`;
					clientPage+=`<script data-session="${quotedSession}" src="/catnip-bundle.js"></script>`;
					clientPage+=`</html></body>`;

					res.end(clientPage);
				})();
			}
		}

		catch (e) {
			console.log(e);
			res.writeHead(500);
			res.end("");
		}
	}	
}