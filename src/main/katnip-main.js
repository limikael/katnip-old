import KatnipActions from "../lib/KatnipActions.js";
import KatnipServerChannels from "../lib/KatnipServerChannels.js";
import SessionManager from "./SessionManager.js";
import SettingsManager from "./SettingsManager.js";
import Db from "../../packages/katnip-orm/src/Db.js";
import {isClient, isServer} from "../utils/js-util.js";
import fetch from "node-fetch";
import crypto from "crypto";

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

const katnip=new MainKatnip();

export const db=katnip.db;
export const serverChannels=katnip.serverChannels;
export const apis=katnip.apis;

export const addModel=katnip.addModel;
export const addApi=katnip.addApi;
export const serverMain=katnip.serverMain;

export const addAction=katnip.actions.addAction;
export const doAction=katnip.actions.doAction;
export const doActionAsync=katnip.actions.doActionAsync;

export const addChannel=katnip.serverChannels.addChannel;
export const getChannelData=katnip.serverChannels.getChannelData;
export const notifyChannel=katnip.serverChannels.notifyChannel;

export const addSetting=katnip.settingsManager.addSetting;
export const getSetting=katnip.settingsManager.getSetting;
export const setSetting=katnip.settingsManager.setSetting;
export const getSettings=katnip.settingsManager.getSettings;
export const addSettingCategory=katnip.settingsManager.addSettingCategory;
export const getSettingCategories=katnip.settingsManager.getSettingCategories;

export const getSessionValue=katnip.sessionManager.getSessionValue;
export const setSessionValue=katnip.sessionManager.setSessionValue;
