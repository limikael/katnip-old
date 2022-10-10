import fs from "fs";
import KatnipRequestHandler from "./KatnipRequestHandler.js";
import KatnipChannelHandler from "./KatnipChannelHandler.js";
import MiddlewareServer from "../mw/MiddlewareServer.js";
import ContentMiddleware from "../mw/ContentMiddleware.js";
import ApiMiddleware from "../mw/ApiMiddleware.js";
import crypto from "crypto";
import KatnipRequest from "../lib/KatnipRequest.js";
import PluginLoader from "../utils/PluginLoader.js";
import {quoteAttr, buildUrl} from "../utils/js-util.js";

export default class KatnipServer {
	constructor(options={}) {
		this.options=options;
	}

	initRequest=async (nodeReq, res, next)=>{
		let req=new KatnipRequest();
		req.processNodeRequest(nodeReq);
		await req.processNodeRequestBody(nodeReq);
		await this.katnip.doActionAsync("initRequest",req);

		next(req);
	}

	handleDefault=async (req, res, next)=>{
		let initChannelIds=["contentHash"];
		await this.katnip.doActionAsync("initChannels",initChannelIds,req);
		for (let channel of this.katnip.getSettings({session: true}))
			initChannelIds.push(channel.id);

		let initChannels={};
		for (let channelId of initChannelIds)
			initChannels[channelId]=await this.katnip.getChannelData(channelId,req);

		let quotedChannels=quoteAttr(JSON.stringify(initChannels));

		res.writeHead(200,{
			"Set-Cookie": `katnip=${req.sessionId}`
		});

		let bundleUrl=buildUrl("/katnip-bundle.js",{hash: this.bundleHash});

		let clientPage=`<body><html>`;
		clientPage+=`<head>`;
		clientPage+=`<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">`;
		clientPage+=`</head>`;
		clientPage+=`<div id="katnip-root"></div>`;
		clientPage+=`<script data-channels="${quotedChannels}" src="${bundleUrl}"></script>`;
		clientPage+=`</html></body>`;

		res.end(clientPage);
	}

	async initPlugins() {
		this.pluginLoader=new PluginLoader();
		this.pluginLoader.addPlugin("node_modules/katnip");
		this.pluginLoader.addExposePlugin("katnip","node_modules/katnip");
		this.pluginLoader.addPluginPath("node_modules/katnip/default_plugins");
		this.pluginLoader.addPluginSpecifier("plugins");
		this.pluginLoader.addPlugin(".");
		this.pluginLoader.addInject("node_modules/katnip/src/utils/preact-shim.js");
		this.pluginLoader.setBundleName("katnip-bundle.js");

		this.outDir=await this.pluginLoader.buildClientBundle();

		await this.pluginLoader.loadPlugins();
	}

	async initContent() {
		this.contentMiddleware=new ContentMiddleware();
		for (let pluginPath of this.pluginLoader.getPluginPaths())
			this.contentMiddleware.addPath(pluginPath+"/public");

		this.bundleHash=this.contentMiddleware.addContent(
			"/katnip-bundle.js",
			fs.readFileSync(this.outDir+"/katnip-bundle.js")+"window.katnip.clientMain();"
		);

		this.mwServer.use(this.contentMiddleware);

		this.katnip.addChannel("contentHash",()=>{
			return this.contentMiddleware.getContentHash();
		});

		console.log("Content hash: "+this.contentMiddleware.getContentHash());
		console.log("Bundle hash: "+this.bundleHash);
	}

	async initApis() {
		let apiMiddleware=new ApiMiddleware();
		for (let k in this.katnip.apis)
			apiMiddleware.addApiMethod(k,this.katnip.apis[k]);

		this.mwServer.use(apiMiddleware);
	}

	async run() {
		let port=this.options.port;
		if (!port)
			port=3000;

		this.katnip=await import("katnip");

		await this.initPlugins();

		console.log("Starting...");
		await this.katnip.serverMain(this.options);

		this.mwServer=new MiddlewareServer();
		this.mwServer.use(this.initRequest);

		await this.initContent();
		await this.initApis();

		this.mwServer.use(this.handleDefault);

		let channelHandler=new KatnipChannelHandler(this.katnip,this.mwServer.server);

		await this.mwServer.listen(port,"0.0.0.0")
		console.log("Running on port "+port);
	}
}