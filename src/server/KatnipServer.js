import fs from "fs";
import KatnipRequestHandler from "./KatnipRequestHandler.js";
import KatnipChannelHandler from "./KatnipChannelHandler.js";
import MiddlewareServer from "../mw/MiddlewareServer.js";
import ContentMiddleware from "../mw/ContentMiddleware.js";
import ApiMiddleware from "../mw/ApiMiddleware.js";
import {createOutDir, getPluginPaths} from "./katnip-server-util.js";
import crypto from "crypto";
import KatnipRequest from "../lib/KatnipRequest.js";
import PluginLoader from "../utils/PluginLoader.js";

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

	async run() {
		this.pluginLoader=new PluginLoader();
		this.pluginLoader.addPluginSpecifier("plugins");
		this.pluginLoader.addPluginPath("node_modules/katnip/default_plugins");
		this.pluginLoader.addPlugin("node_modules/katnip");
		this.pluginLoader.addPlugin(".");

		this.outDir=await this.pluginLoader.buildClientBundle();

		this.katnip=await import("katnip");
		await this.pluginLoader.loadPlugins();

		this.katnip.addChannel("contentHash",()=>{
			return this.contentMiddleware.getContentHash();
		});

		this.katnip.addAction("initChannels",(channelIds, req)=>{
			channelIds.push("contentHash");
		});

		let port=this.options.port;
		if (!port)
			port=3000;

		console.log("Starting...");
		await this.katnip.serverMain(this.options);

		this.requestHandler=new KatnipRequestHandler(this.katnip,this.options);

		this.mwServer=new MiddlewareServer();
		this.mwServer.use(this.initRequest);

		this.contentMiddleware=new ContentMiddleware();
		for (let pluginPath of getPluginPaths())
			this.contentMiddleware.addPath(pluginPath+"/public");

		let bundleHash=this.contentMiddleware.addContent(
			"/katnip-bundle.js",
			fs.readFileSync(this.outDir+"/katnip-bundle.js")+"window.katnip.clientMain();"
		);

		this.requestHandler.setBundleHash(bundleHash);
		console.log("Content hash: "+this.contentMiddleware.getContentHash());

		this.mwServer.use(this.contentMiddleware);

		let apiMiddleware=new ApiMiddleware();
		for (let k in this.katnip.apis)
			apiMiddleware.addApiMethod(k,this.katnip.apis[k]);

		this.mwServer.use(apiMiddleware);

		this.mwServer.use((req, res, next)=>{
			this.requestHandler.handleRequest(req,res);
		});

		//let server=http.createServer(this.requestHandler.handleRequest);
		let channelHandler=new KatnipChannelHandler(this.katnip,this.mwServer.server);

		await this.mwServer.listen(port,"0.0.0.0")
		console.log("Running on port "+port);

		/*server.listen(port,"0.0.0.0",()=>{
			console.log("Running on port "+port);
		});*/
	}
}