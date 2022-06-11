import CatnipActions from "../lib/CatnipActions.js";
import CatnipServerChannels from "../lib/CatnipServerChannels.js";
import SessionManager from "./SessionManager.js";
import CatnipSettings from "../lib/CatnipSettings.js";
import Db from "../orm/Db.js";
import {isClient, isServer, retry} from "../utils/js-util.js";
import fetch from "node-fetch";
import crypto from "crypto";

global.fetch=fetch;
global.crypto=crypto;

class MainCatnip {
	constructor() {
		this.actions=new CatnipActions();
		this.composeFunctions(this.actions);

		this.db=new Db();
		this.apis={};

		this.settings=new CatnipSettings(this);
		this.composeFunctions(this.settings);

		this.serverChannels=new CatnipServerChannels(this);
		this.composeFunctions(this.serverChannels);

		this.sessionManager=new SessionManager(this);

		/*this.serverSessions=new CatnipServerSessions(this);
		this.composeFunctions(this.serverSessions);*/

		/*for (let k in this)
			if (typeof this[k]=='function' &&
					k!="composeFunctions" &&
					k!="load")
				console.log(`export const ${k}=catnip.${k};`);*/
	}

	composeFunctions=(o)=>{
		for (let k in o)
			if (typeof o[k]=='function')
				this[k]=o[k];
	}

	addModel=(model)=>{
		if (!isServer())
			return;

		this.db.addModel(model);
	}

	addApi=(path, fn)=>{
		if (!isServer())
			return;

		this.apis[path]=fn;
	}

	assertFreeName=(name)=>{
		this.settings.assertFreeName(name);
		this.serverChannels.assertFreeName(name);
	}

	serverMain=async (options)=>{
		let retryOptions={
			times: 6*2,
			delay: 10000,
			onerror: (e)=>{
				console.log("Connection failed, trying again: "+e.message)
			}
		};

		await retry(async ()=>{
			await this.db.connect(options.dsn);
		},retryOptions);

		if (!options.hasOwnProperty("dbinstall"))
			options["dbinstall"]=true;

		if (options["dbinstall"]) {
			console.log("Installing database schema...");
			await this.db.install();
		}

		await this.sessionManager.loadSessions();
		await this.settings.loadSettings();

		await this.doActionAsync("serverMain",options);
	}
}

const catnip=new MainCatnip();

export const db=catnip.db;
export const serverChannels=catnip.serverChannels;
export const apis=catnip.apis;

export const addModel=catnip.addModel;
export const addApi=catnip.addApi;
export const serverMain=catnip.serverMain;
export const addAction=catnip.addAction;
export const doAction=catnip.doAction;
export const doActionAsync=catnip.doActionAsync;
export const getSetting=catnip.getSetting;
export const setSetting=catnip.setSetting;
export const addChannel=catnip.addChannel;
export const getChannelData=catnip.getChannelData;
export const notifyChannel=catnip.notifyChannel;
export const addSetting=catnip.addSetting;
export const getSettings=catnip.getSettings;
export const addSettingCategory=catnip.addSettingCategory;
export const getSettingCategories=catnip.getSettingCategories;
export const getSessionValue=catnip.sessionManager.getSessionValue;
export const setSessionValue=catnip.sessionManager.setSessionValue;
