import {v4 as uuidv4} from 'uuid';
import {quoteAttr, delay} from "../utils/js-util.js";
import {getPluginPaths} from "./catnip-server-util.js";
import fs from "fs";

export default class CatnipRequestHandler {
	constructor(catnip, options) {
		this.catnip=catnip;
		this.options=options;
		this.startTime=Date.now();
	}

	setClientBundle(bundle) {
		this.clientBundle=bundle;
	}

	computeETag=(entity)=>{
		let hash = crypto
			.createHash('sha1')
			.update(entity, 'utf8')
			.digest('base64')
			.substring(0, 27)

		let len = typeof entity==='string'
			?Buffer.byteLength(entity,'utf8')
			:entity.length

		return '"' + len.toString(16) + '-' + hash + '"';
	}

	handleContent=(req, res, content, headers)=>{
		headers["ETag"]=this.computeETag(content);

		let len=typeof content==='string'
			?Buffer.byteLength(content,'utf8')
			:content.length

		headers["Content-Length"]=len;
		headers["Cache-Control"]="public, max-age=0";

		if (req.headers["if-none-match"]==headers["ETag"]) {
			res.writeHead(304,headers);
			res.end();
			return;
		}

		res.writeHead(200,headers);
		res.end(content);
	}

	getFileMimeType(fn) {
		let ext=fn.split('.').pop().toLowerCase();
		let types={
			"jpg": "image/jpeg",
			"jpeg": "image/jpeg",
			"png": "image/png",
			"js": "application/javascript",
			"css": "text/css"
		};

		if (types[ext])
			return types[ext];

		return "application/octet-stream";
	}

	handlePublic=(req, res)=> {
		let pluginPaths=getPluginPaths();

		for (let pluginName in pluginPaths) {
			let cand=pluginPaths[pluginName]+"/"+req.url;

			if (fs.existsSync(cand)) {
				let mtime=fs.statSync(cand).mtime;
				this.handleContent(req,res,fs.readFileSync(cand),{
					"Content-Type": this.getFileMimeType(cand),
					"Last-Modified": new Date(mtime).toUTCString()
				});
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
			if (req.url=="/catnip-bundle.js")
				this.handleContent(req,res,this.clientBundle,{
					"Content-Type": "application/javascript",
					"Last-Modified": new Date(this.startTime).toUTCString()
				});

			else if (req.url.startsWith("/api/"))
				await this.handleApi(req,res,cookies.catnip);

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
					clientPage+=`<head>`;
					clientPage+=`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">`;
					clientPage+=`</head>`;
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