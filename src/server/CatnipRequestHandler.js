import {v4 as uuidv4} from 'uuid';
import {quoteAttr, delay, parseRequest, buildUrl} from "../utils/js-util.js";
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
		this.bundleHash=crypto
			.createHash('sha1')
			.update(bundle, 'utf8')
			.digest('hex');
	}

	setContentHash(contentHash) {
		this.contentHash=contentHash;
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

		if (!headers["Cache-Control"])
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
		let urlreq=parseRequest(req.url,"http://example.com/");

		for (let pluginName in pluginPaths) {
			let cand=pluginPaths[pluginName]+"/"+urlreq.path;

			if (fs.existsSync(cand)) {
				let mtime=fs.statSync(cand).mtime;
				let headers={
					"Content-Type": this.getFileMimeType(cand),
					"Last-Modified": new Date(mtime).toUTCString()
				};

				if (urlreq.query.contentHash &&
						urlreq.query.contentHash==this.contentHash)
					headers["Cache-Control"]="public, max-age=31536000";

				this.handleContent(req,res,fs.readFileSync(cand),headers);
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

	handleDefault=async (req, res, cookie)=>{
		let clientSession={};
		let sessionRequest=await catnip.initSessionRequest(cookie);
		await this.catnip.doActionAsync("getClientSession",clientSession,sessionRequest);

		clientSession.contentHash=this.contentHash;

		res.writeHead(200,{
			"Set-Cookie": `catnip=${cookie}`
		});

		let quotedSession=quoteAttr(JSON.stringify(clientSession));
		let bundleUrl=buildUrl("/catnip-bundle.js",{
			bundleHash: this.bundleHash
		});

		let clientPage=`<body><html>`;
		clientPage+=`<head>`;
		clientPage+=`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">`;
		clientPage+=`</head>`;
		clientPage+=`<div id="catnip-root"></div>`;
		clientPage+=`<script data-session="${quotedSession}" src="${bundleUrl}"></script>`;
		clientPage+=`</html></body>`;

		res.end(clientPage);
	}

	handleRequest=async (req, res)=>{
		let cookies=this.catnip.parseCookies(req);
		if (!cookies.catnip)
			cookies.catnip=uuidv4();

		let urlreq=parseRequest(req.url,"http://example.com/");

		try {
			if (urlreq.path=="/catnip-bundle.js") {
				let headers={
					"Content-Type": "application/javascript",
					"Last-Modified": new Date(this.startTime).toUTCString()
				};

				if (urlreq.query.bundleHash &&
						urlreq.query.bundleHash==this.bundleHash)
					headers["Cache-Control"]="public, max-age=31536000";

				this.handleContent(req,res,this.clientBundle,headers);
			}

			else if (req.url.startsWith("/api/"))
				await this.handleApi(req,res,cookies.catnip);

			else if (req.url.startsWith("/public/"))
				await this.handlePublic(req,res);

			else
				await this.handleDefault(req,res,cookies.catnip);
		}

		catch (e) {
			console.log(e);
			res.writeHead(500);
			res.end("");
		}
	}	
}