import Model from "../orm/Model.js";
import {isServer} from "../utils/js-util.js";

class Setting extends Model {
	static tableName="Setting";

	static fields={
		id: "VARCHAR(255) NOT NULL",
		value: "JSON"
	}
}

export default class SettingsManager {
	constructor(catnip) {
		this.catnip=catnip;
		this.settings={};
		this.categories={};

		this.catnip.db.addModel(Setting);
	}

	getSetting=(id)=>{
		if (!this.settings[id])
			throw new Error("No such setting: "+id);

		return this.settings[id].value;
	}

	assertFreeName=(name)=>{
		if (this.settings[name])
			throw new Error("Already a setting: "+name);
	}

	addSetting=(id, settingConf={})=>{
		this.catnip.assertFreeName(id);

		settingConf.id=id;
		if (!settingConf.title)
			settingConf.title=settingConf.id;

		this.settings[id]=new Setting(settingConf);
	}

	setSetting=async (id, value)=>{
		if (!this.settings[id])
			throw new Error("No such setting: "+id);

		this.settings[id].value=value;
		await this.settings[id].save();

		this.catnip.serverChannels.notifyChannel(id);
	}

	loadSettings=async ()=>{
		for (let setting of await Setting.findMany()) {
			if (this.settings[setting.id])
				this.settings[setting.id].value=setting.value;

			else
				console.log("Unknown setting in db: "+setting.id);
		}
	}

	getSettings=(q={})=>{
		let res=[];

		if (q.id) {
			if (this.settings[q.id])
				return [this.settings[q.id]];

			return [];
		}

		for (let id in this.settings) {
			let setting=this.settings[id];
			if (!q.category || setting.category==q.category)
				if (!q.session || setting.session)
					res.push(setting);
		}

		return res;
	}

	getSettingCategories=()=>{
		return this.categories;
	}

	addSettingCategory=(id, category={})=>{
		category.id=id;
		this.categories[id]=category;
	}
}