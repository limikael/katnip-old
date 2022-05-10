import {isClient, isServer} from "../utils/js-util.js";
import Model from "../orm/Model.js";

class Setting extends Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		key: "VARCHAR(255) NOT NULL",
		value: "TEXT"
	}
}

export default class CatnipSettings {
	constructor(db) {
		if (isServer()) {
			this.settings={};

			db.addModel(Setting);
		}
	}

	getSetting=(key)=>{
		return this.settings[key];
	}

	setSetting=async (key, value)=>{
		this.settings[key]=value;

		let setting=await Setting.findOne({key: key});
		if (!setting) {
			setting=new Setting()
			setting.key=key;
		}

		setting.value=JSON.stringify(this.settings[key]);
		await setting.save();
	}

	loadSettings=async ()=>{
		for (let setting of await Setting.findMany()) 
			this.settings[setting.key]=JSON.parse(setting.value);
	}
}