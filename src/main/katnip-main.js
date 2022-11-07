import Actions from "../utils/Actions.js";
import KatnipServerChannels from "./KatnipServerChannels.js";
import SessionManager from "./SessionManager.js";
import SettingsManager from "./SettingsManager.js";
import Db from "../orm/Db.js";
import {quoteAttr, delay, buildUrl, fetchEx} from "../utils/js-util.js";
import nodeFetch from "node-fetch";
import KatnipPluginLoader from "./KatnipPluginLoader.js";
import KatnipCommands from "./KatnipCommands.js";
import PackageManager from "../utils/PackageManager.js";
import KatnipRequestHandler from "../auth/KatnipRequestHandler.js";
import User from "../auth/User.js";
import fs from "fs";

if (!global.fetch)
	global.fetch=nodeFetch;

class MainKatnip {
	constructor() {
		this.actions=new Actions();

		this.db=new Db();
		this.apis={};

		this.settingsManager=new SettingsManager(this);
		this.serverChannels=new KatnipServerChannels(this);
		this.sessionManager=new SessionManager(this);
		this.packageManager=new PackageManager();
		this.requestHandler=new KatnipRequestHandler(this);
	}

	installDb=async (dsn)=>{
		if (this.options.dsn)
			throw new Error("Not install mode");

		if (!this.options.webProcessChild)
			throw new Error("Not running in spawned mode.");

		console.log("Installing database...");

		let db=new Db(dsn);
		await this.packageManager.verifyPackage(db.getDependencyPackage());
		await db.connect();

		let env="";
		if (fs.existsSync(process.cwd()+"/.env"))
			env=fs.readFileSync(process.cwd()+"/.env","utf8");

		env+="\nDSN="+dsn+"\n";
		fs.writeFileSync(process.cwd()+"/.env",env);

		await this.restart();
	}

	checkAdmin=async ()=>{
		if (await User.findOne({role: "admin"})) {
			this.haveAdmin=true;
			this.serverChannels.notifyChannel("redirect");
		}
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

	async initPlugins(createBundle=true) {
		this.pluginLoader=new KatnipPluginLoader(this);

		await this.pluginLoader.loadPlugins();

		if (createBundle)
			await this.pluginLoader.buildClientBundle(this.options);
	}

	runCommand=async (commandRunner)=>{
		this.options=commandRunner.getCommand().getNamedArguments();
		this.commandRunner=commandRunner;

		let katnipCommands=new KatnipCommands(this);
		katnipCommands.initCommandRunner();

		await this.initPlugins(false);

		if (commandRunner.getCommand().level=="postdb") {
			await this.db.connect(this.options.dsn);
			await this.db.install();

			await this.sessionManager.loadSessions();
			await this.settingsManager.loadSettings();
		}

		return await commandRunner.run();
	}

	addCommand(name, fn, command={}) {
		if (this.commandRunner)
			this.commandRunner.addCommand(name, fn, command={});
	}

	restart=async ()=>{
		if (!this.options.webProcessChild)
			throw new Error("Not running in spawned mode.");

		await this.options.webProcessChild.restart();
	}

	run=async (options)=>{
		this.options=options;

		console.log("Loading plugins...");
		await this.initPlugins();

		if (this.options.dsn) {
			console.log("Installing database schema...");
			await this.db.connect(options.dsn);
			await this.db.install();

			await this.sessionManager.loadSessions();
			await this.settingsManager.loadSettings();

			console.log("Initializing plugins...");
			await this.actions.doActionAsync("serverMain",options);
			await this.checkAdmin();
		}

		else {
			console.log("No DSN, starting unitialized...");
		}

		if (options.webProcessChild) {
			let child=options.webProcessChild;

			child.on("stop",()=>{
				console.log("Exiting child process...");
				this.requestHandler.close();
				this.serverChannels.send({type: "reload"});
			});

			let parentServer=await child.initialized();
			await this.requestHandler.listen(parentServer);
			await child.notifyListening();

			console.log("Attached to parent process...");
		}

		else {
			await this.requestHandler.listen(this.options.port,"0.0.0.0");
			console.log("Running on port "+this.options.port);
		}
	}

	apiFetch=async (url, query={}, options={})=>{
		let o={
			...options,
			query: query,
			processResult: this.processApiFetchResult
		};

		return await fetchEx(url,o);
	}
}

const katnip=new MainKatnip();

export const apiFetch=katnip.apiFetch;

export const run=katnip.run;
export const restart=katnip.restart;
export const runCommand=katnip.runCommand;
export const addCommand=katnip.addCommand;
export const installDb=katnip.installDb;
export const checkAdmin=katnip.checkAdmin;

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