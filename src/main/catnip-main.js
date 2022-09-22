import CatnipActions from "../lib/CatnipActions.js";
import CatnipServerChannels from "../lib/CatnipServerChannels.js";
import SessionManager from "./SessionManager.js";
import SettingsManager from "./SettingsManager.js";
import Db from "../../packages/catnip-orm/src/Db.js";
import {isClient, isServer} from "../utils/js-util.js";
import fetch from "node-fetch";
import crypto from "crypto";

global.fetch=fetch;
global.crypto=crypto;

class MainCatnip {
	constructor() {
		this.actions=new CatnipActions();

		this.db=new Db();
		this.apis={};

		this.settingsManager=new SettingsManager(this);
		this.serverChannels=new CatnipServerChannels(this);
		this.sessionManager=new SessionManager(this);
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
		this.settingsManager.assertFreeName(name);
		this.serverChannels.assertFreeName(name);
	}

	serverMain=async (options)=>{
		console.log("Installing database schema...");
		await this.db.connect(options.dsn);
		await this.db.install();

		await this.sessionManager.loadSessions();
		await this.settingsManager.loadSettings();

		await this.actions.doActionAsync("serverMain",options);
	}
}

const catnip=new MainCatnip();

export const db=catnip.db;
export const serverChannels=catnip.serverChannels;
export const apis=catnip.apis;

export const addModel=catnip.addModel;
export const addApi=catnip.addApi;
export const serverMain=catnip.serverMain;

export const addAction=catnip.actions.addAction;
export const doAction=catnip.actions.doAction;
export const doActionAsync=catnip.actions.doActionAsync;

export const addChannel=catnip.serverChannels.addChannel;
export const getChannelData=catnip.serverChannels.getChannelData;
export const notifyChannel=catnip.serverChannels.notifyChannel;

export const addSetting=catnip.settingsManager.addSetting;
export const getSetting=catnip.settingsManager.getSetting;
export const setSetting=catnip.settingsManager.setSetting;
export const getSettings=catnip.settingsManager.getSettings;
export const addSettingCategory=catnip.settingsManager.addSettingCategory;
export const getSettingCategories=catnip.settingsManager.getSettingCategories;

export const getSessionValue=catnip.sessionManager.getSessionValue;
export const setSessionValue=catnip.sessionManager.setSessionValue;
