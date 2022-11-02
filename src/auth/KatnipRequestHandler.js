import MiddlewareServer from "../mw/MiddlewareServer.js";
import ContentMiddleware from "../mw/ContentMiddleware.js";
import ApiMiddleware from "../mw/ApiMiddleware.js";
import KatnipServerRequest from "../auth/KatnipServerRequest.js";
import {buildUrl, quoteAttr} from "../utils/js-util.js";
import User from "./User.js";
import UserAuthMethod from "./UserAuthMethod.js";
import fs from "fs";

export default class KatnipRequestHandler {
	constructor(katnip) {
		this.katnip=katnip;

		this.katnip.db.addModel(User);
		this.katnip.db.addModel(UserAuthMethod);

		let sc=this.katnip.serverChannels;
		sc.addChannel("authMethods",this.authMethodsChannel);
		sc.addChannel("user",this.userChannel);
		sc.addChannel("redirect",this.redirectChannel);
	}

	redirectChannel=async ({}, req)=>{
		if (!this.katnip.options.dsn)
			return "/installdb";

		if (!this.katnip.haveAdmin)
			return "/installadmin";
	}

	authMethodsChannel=async ({}, req)=>{
		let authMethods=[];

		let ac=this.katnip.actions;
		await ac.doActionAsync("authMethods",authMethods,req);

		return authMethods;
	}

	userChannel=async ({sessionId}, req)=>{
		if (req.sessionId!=sessionId)
			throw new Error("Wrong session");

		if (!req.getUser())
			return null;

		return req.getUser();
	}

	initRequest=async (nodeReq, res, next)=>{
		try {
			let req=new KatnipServerRequest(this.katnip,nodeReq);
			await req.initUserFromSession();
			await req.processNodeRequestBody(nodeReq);
			next(req);
		}

		catch (e) {
			console.log("init request error...");
			console.log(e);
			res.writeHead(500);
			res.end(e.message);
		}
	}

	async initContent() {
		this.contentMiddleware=new ContentMiddleware();
		for (let pluginPath of this.katnip.pluginLoader.getPluginPaths())
			this.contentMiddleware.addPath(pluginPath+"/public");

		this.bundleHash=this.contentMiddleware.addContent(
			"/katnip-bundle.mjs",
			fs.readFileSync(this.katnip.outDir+"/katnip-bundle.mjs")/*+" window.katnip.clientMain();"*/
		);

		this.contentMiddleware.addContent(
			"/katnip-bundle.mjs.map",
			fs.readFileSync(this.katnip.outDir+"/katnip-bundle.mjs.map")
		);

		this.mwServer.use(this.contentMiddleware);

		this.katnip.serverChannels.addChannel("contentHash",()=>{
			return this.contentMiddleware.getContentHash();
		});

		this.katnip.serverChannels.addChannel("bundleHash",()=>{
			return this.bundleHash;
		});

		console.log("Content hash: "+this.contentMiddleware.getContentHash());
		console.log("Bundle hash: "+this.bundleHash);
	}

	processApiResult=async (result, req, res)=>{
		if (req.piggybackedChannels.length) {
			let wrappedData={result, channelValues: {}};

			for (let channelId of req.piggybackedChannels)
				wrappedData.channelValues[channelId]=await 
					this.katnip.serverChannels.getChannelData(channelId,req);

			res.setHeader("X-Katnip-Type","wrapped");

			return wrappedData;
		}

		return result;
	}

	async initApis() {
		let apiMiddleware=new ApiMiddleware();
		apiMiddleware.processResult=this.processApiResult;
		for (let k in this.katnip.apis)
			apiMiddleware.addApiMethod(k,this.katnip.apis[k]);

		this.mwServer.use(apiMiddleware);
	}

	handleDefault=async (req, res, next)=>{
		let initChannelIds=[
			"redirect",
			"contentHash",
			"bundleHash",
			"authMethods",
			buildUrl("user",{sessionId: req.sessionId})
		];

		await this.katnip.actions.doActionAsync("initChannels",initChannelIds,req);
		for (let channel of this.katnip.settingsManager.getSettings({session: true}))
			initChannelIds.push(channel.id);

		let initChannels={};
		for (let channelId of initChannelIds)
			initChannels[channelId]=await this.katnip.serverChannels.getChannelData(channelId,req);

		let cookieExtra="";
		if (req.protocol=="https")
			cookieExtra="; SameSite=None; Secure "

		res.writeHead(200,{
			"Set-Cookie": `katnip=${req.sessionId}${cookieExtra}`
		});

		let bundleUrl=buildUrl("/katnip-bundle.mjs",{hash: this.bundleHash});

		let ssr=this.katnip.clientModule.ssrPassOne(req);
		for (let k in ssr.apiCalls) {
			let c=ssr.apiCalls[k];
			c.result=await this.katnip.apis[c.url](c.query,req);
		}

		ssr.channels=initChannels;

		let clientPage=`<body><html>\n`;
		clientPage+=`<head>\n`;
		clientPage+=`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">\n`;
		clientPage+=`</head>\n`;
		clientPage+=`<div id="katnip-root"></div>\n`;
		clientPage+=this.katnip.clientModule.ssrPassTwo(req,ssr);
//		clientPage+=`<script type="module">\n`;
//		clientPage+=`  import {katnip} from "${bundleUrl}";\n`;
//		clientPage+=`  katnip.clientMain({initChannels: ${JSON.stringify(initChannels)}});\n`;
//		clientPage+=`</script>\n`;
		clientPage+=`</html></body>`;

		res.end(clientPage);
	}

	close() {
		this.mwServer.close();
	}

	async listen(...args) {
		this.mwServer=new MiddlewareServer();
		this.katnip.serverChannels.attachToServer(this.mwServer.server);

		this.mwServer.use(this.initRequest);
		await this.initContent();
		await this.initApis();
		this.mwServer.use(this.handleDefault);

		await this.mwServer.listen(...args);
	}
}