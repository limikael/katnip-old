import Actions from "../utils/Actions.js";
import KatnipServerChannels from "./KatnipServerChannels.js";
import SessionManager from "./SessionManager.js";
import SettingsManager from "./SettingsManager.js";
import Db from "../orm/Db.js";
import {quoteAttr, delay, buildUrl, fetchEx} from "../utils/js-util.js";
import nodeFetch from "node-fetch";
import KatnipPluginLoader from "./KatnipPluginLoader.js";
import PackageManager from "../utils/PackageManager.js";
import KatnipRequestHandler from "../auth/KatnipRequestHandler.js";
import User from "../auth/User.js";
import fs from "fs";

if (!global.fetch)
	global.fetch=nodeFetch;

/**
 * Katnip server functions.
 *
 * Functions accessible on the server side. These are accessed by importing
 * the `katnip` module, e.g.
 * ```
 * import katnip from "katnip";
 *
 * katnip.addModel(...);
 * ```
 *
 * @section Server Functions
 */
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
		this.pluginLoader=new KatnipPluginLoader(this);
	}

	installDb=async (dsn)=>{
		if (this.options.dsn)
			throw new Error("Not install mode");

		if (!this.options.webProcessChild)
			throw new Error("Not running in spawned mode.");

		console.log("Installing database...");

		let db=new Db(dsn);
		await this.packageManager.installPackage(db.getDependencyPackage());
		await db.connect();

		let env="";
		if (fs.existsSync(process.cwd()+"/.env"))
			env=fs.readFileSync(process.cwd()+"/.env","utf8");

		env+="\nDSN="+dsn+"\n";
		fs.writeFileSync(process.cwd()+"/.env",env);

		await this.restart();
	}

	isDbInstalled=()=>{
		if (this.options.dsn)
			return true;

		return false;
	}

	checkAdmin=async ()=>{
		if (await User.findOne({role: "admin"})) {
			this.haveAdmin=true;
			this.serverChannels.notifyChannel("redirect");
		}
	}

	/**
	 * Add a model to the database.
	 *
	 * This function adds a model (i.e. database table) to the database.
	 * The `model` argument should be a class extending
	 * [Model](/documentation/katnip/model).
	 * @function Server Functions.addModel
	 * @param model:Model The model to add.
	 */
	addModel=(model)=>{
		this.db.addModel(model);
	}

	/**
	 * Add an api function.
	 *
	 * This function adds an api endpoint at the specified path.
	 * The function passed as the second argument is the function to
	 * handle the api call. This function can be asyncronous and should
	 * return a plain JavaScript object, which will be serialized and
	 * returned in the body of the request. The handler function will be
	 * called with the following arguments:
	 * * **query** - This is an object containing the query variables passed
	 *               in the HTTP request.
	 * * **req** - This is a [Request](/documentation/katnip/Request) object
	 *             containing details about the request.
	 * @function Server Functions.addApi
	 * @param path:String The path for the endpoint.
	 * @param fn:function The function to handle incoming requests.
	 */
	addApi=(path, fn)=>{
		this.apis[path]=fn;
	}

	assertFreeName=(name)=>{
		this.settingsManager.assertFreeName(name);
		this.serverChannels.assertFreeName(name);
	}

	async initPlugins(createBundle=true) {
		await this.pluginLoader.loadPlugins();

		let pluginBundles={admin:[]};
		this.actions.doAction("getPluginBundles",pluginBundles);

		//console.log(JSON.stringify(pluginBundles));

		if (createBundle)
			await this.pluginLoader.buildClientBundle(pluginBundles,this.options);
	}

	runCommand=async (commandRunner)=>{
		this.options=commandRunner.getCommand().getNamedArguments();
		this.commandRunner=commandRunner;

		await this.initPlugins(false);

		if (commandRunner.getCommand().level=="postdb") {
			await this.db.connect(this.options.dsn);
			await this.db.install();

			await this.sessionManager.loadSessions();
			await this.settingsManager.loadSettings();
		}

		return await commandRunner.run();
	}

	/**
	 * Add a CLI command.
	 *
	 * This function adds a command to be made available by the katnip CLI command.
	 * The options argument is an object with the following fields:
	 *
	 * * **desc** - Short description of the command. Will be shown when a user types
	 *              `katnip --help`.
	 * * **args** - Object containing arguments. The name of the argument should go
	 *              in the key, and the specification in the value.
	 *
	 * Each entry in the args object accepts the following fields:
	 *
	 * * **desc** - Short description of the argument. Will be shown when a user types
	 *              `katnip --help`.
	 * * **env** - Define an environment variable that can also hold the value for this option.
	 * * **type** - Type of the argument.
	 * * **default** - Default value.
	 *
	 * @function Server Functions.addCommand
	 * @param name:String The name of the command.
	 * @param fn:Function The function to handle the command.
	 * @param options:Object Options for the command.
	 */
	addCommand=(name, fn, command={})=>{
		if (this.commandRunner)
			this.commandRunner.addCommand(name, fn, command);
	}

	/**
	 * Restart the katnip server.
	 *
	 * This function restarts the server. It returns a Promise
	 * that never resolves. For this function to work, the server
	 * needs to run in spawned mode.
	 *
	 * @function async Server Functions.restart
	 */
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
			query: query
		};

		return await fetchEx(url,o);
	}

	getOption=(id)=>{
		return this.options[id];
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
export const isDbInstalled=katnip.isDbInstalled;

export const db=katnip.db;

export const addModel=katnip.addModel;
export const addApi=katnip.addApi;
export const serverMain=katnip.serverMain;

export const addAction=katnip.actions.addAction;
export const doAction=katnip.actions.doAction;
export const doActionAsync=katnip.actions.doActionAsync;

export const addChannel=katnip.serverChannels.addChannel;
export const notifyChannel=katnip.serverChannels.notifyChannel;

export const getOption=katnip.getOption;

export const addSetting=katnip.settingsManager.addSetting;
export const getSetting=katnip.settingsManager.getSetting;
export const setSetting=katnip.settingsManager.setSetting;
export const getSettings=katnip.settingsManager.getSettings;
export const addSettingCategory=katnip.settingsManager.addSettingCategory;
export const getSettingCategories=katnip.settingsManager.getSettingCategories;

export const installPackage=katnip.packageManager.installPackage;
export const uninstallPackage=katnip.packageManager.uninstallPackage;
export const getProjectDir=katnip.pluginLoader.getProjectDir;
