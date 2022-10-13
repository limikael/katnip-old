import KatnipActions from "../lib/KatnipActions.js";
import KatnipServerChannels from "./KatnipServerChannels.js";
import SessionManager from "./SessionManager.js";
import SettingsManager from "./SettingsManager.js";
import Db from "../../packages/katnip-orm/src/Db.js";
import {quoteAttr, delay, buildUrl} from "../utils/js-util.js";
import fetch from "node-fetch";
import crypto from "crypto";
import PluginLoader from "../utils/PluginLoader.js";
import MiddlewareServer from "../mw/MiddlewareServer.js";
import ContentMiddleware from "../mw/ContentMiddleware.js";
import ApiMiddleware from "../mw/ApiMiddleware.js";
import KatnipRequest from "../lib/KatnipRequest.js";
import fs from "fs";

global.fetch=fetch;
global.crypto=crypto;

class MainKatnip {
	constructor() {
		this.actions=new KatnipActions();

		this.db=new Db();
		this.apis={};

		this.settingsManager=new SettingsManager(this);
		this.serverChannels=new KatnipServerChannels(this);
		this.sessionManager=new SessionManager(this);
	}

	addModel=(model)=>{
		this.db.addModel(model);
	}

	addApi=(path, fn)=>{
		this.apis[path]=fn;
	}

	assertFreeName=(name)=>{
		this.settingsManager.assertFreeName(name);
		this.serverChannels.assertFreeName(name);
	}

	initRequest=async (nodeReq, res, next)=>{
		let req=new KatnipRequest();
		req.processNodeRequest(nodeReq);
		await req.processNodeRequestBody(nodeReq);
		await this.actions.doActionAsync("initRequest",req);

		next(req);
	}

	handleDefault=async (req, res, next)=>{
		let initChannelIds=["contentHash","bundleHash"];
		await this.actions.doActionAsync("initChannels",initChannelIds,req);
		for (let channel of this.settingsManager.getSettings({session: true}))
			initChannelIds.push(channel.id);

		let initChannels={};
		for (let channelId of initChannelIds)
			initChannels[channelId]=await this.serverChannels.getChannelData(channelId,req);

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

		this.outDir=await this.pluginLoader.buildClientBundle(this.options);

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

		this.contentMiddleware.addContent(
			"/katnip-bundle.js.map",
			fs.readFileSync(this.outDir+"/katnip-bundle.js.map")
		);

		this.mwServer.use(this.contentMiddleware);

		this.serverChannels.addChannel("contentHash",()=>{
			return this.contentMiddleware.getContentHash();
		});

		this.serverChannels.addChannel("bundleHash",()=>{
			return this.bundleHash;
		});

		console.log("Content hash: "+this.contentMiddleware.getContentHash());
		console.log("Bundle hash: "+this.bundleHash);
	}

	async initApis() {
		let apiMiddleware=new ApiMiddleware();
		for (let k in this.apis)
			apiMiddleware.addApiMethod(k,this.apis[k]);

		this.mwServer.use(apiMiddleware);
	}

	run=async (options={})=>{
		this.options=options;
		if (!this.options.port && !this.options.webProcessChild)
			this.options.port=3000;

		console.log("Loading plugins...");
		await this.initPlugins();

		console.log("Installing database schema...");
		await this.db.connect(options.dsn);
		await this.db.install();

		await this.sessionManager.loadSessions();
		await this.settingsManager.loadSettings();

		console.log("Initializing plugins...");
		await this.actions.doActionAsync("serverMain",options);

		console.log("Initializing content...");
		this.mwServer=new MiddlewareServer();
		this.mwServer.use(this.initRequest);

		await this.initContent();
		await this.initApis();

		this.mwServer.use(this.handleDefault);

		this.serverChannels.attachToServer(this.mwServer.server);

		if (options.webProcessChild) {
			let child=options.webProcessChild;

			child.on("stop",()=>{
				console.log("Exiting child process...");
				this.mwServer.close();
				this.serverChannels.send({type: "reload"});
			});

			let parentServer=await child.initialized();
			await this.mwServer.listen(parentServer);
			await child.notifyListening();

			console.log("Attached to parent process...");

		}

		else {
			console.log("Reimplement!!! Starting server...");
			//await this.mwServer.listen(this.options.port,"0.0.0.0")
			//console.log("Running on port "+this.options.port);
		}
	}
}

const katnip=new MainKatnip();

export const run=katnip.run;

export const db=katnip.db;

export const addModel=katnip.addModel;
export const addApi=katnip.addApi;
export const serverMain=katnip.serverMain;

export const addAction=katnip.actions.addAction;
export const doAction=katnip.actions.doAction;
export const doActionAsync=katnip.actions.doActionAsync;

export const addChannel=katnip.serverChannels.addChannel;
export const notifyChannel=katnip.serverChannels.notifyChannel;

export const addSetting=katnip.settingsManager.addSetting;
export const getSetting=katnip.settingsManager.getSetting;
export const setSetting=katnip.settingsManager.setSetting;
export const getSettings=katnip.settingsManager.getSettings;
export const addSettingCategory=katnip.settingsManager.addSettingCategory;
export const getSettingCategories=katnip.settingsManager.getSettingCategories;

export const getSessionValue=katnip.sessionManager.getSessionValue;
export const setSessionValue=katnip.sessionManager.setSessionValue;
