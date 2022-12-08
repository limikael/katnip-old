import Model from "../orm/Model.js";
import {isServer} from "../utils/js-util.js";

class Setting extends Model {
	static tableName="Setting";

	static fields={
		id: "VARCHAR(255) NOT NULL PRIMARY KEY",
		value: "JSON"
	}
}

export default class SettingsManager {
	constructor(katnip) {
		this.katnip=katnip;
		this.settings={};
		this.categories={};

		this.katnip.db.addModel(Setting);
	}

	/**
	 * Get the value of a setting.
	 *
	 * @function Server Functions.getSetting
	 * @param id:String The setting to get.
	 */
	getSetting=(id)=>{
		if (!this.settings[id])
			throw new Error("No such setting: "+id);

		return this.settings[id].value;
	}

	assertFreeName=(name)=>{
		if (this.settings[name])
			throw new Error("Already a setting: "+name);
	}

	/**
	 * Register a setting.
	 *
	 * The configuration object accepts the following fields:
	 *
	 * * **title** - Title for the setting, as shown in the admin interface.
	 * * **category** - Category for the setting.
	 * * **session** - True if this setting should be made available as a channel.
	 *
	 * @function Server Functions.addSetting
	 * @param id:String The setting.
	 * @param conf:Object Configuration for the setting.
	 */
	addSetting=(id, settingConf={})=>{
		this.katnip.assertFreeName(id);

		settingConf.id=id;
		if (!settingConf.title)
			settingConf.title=settingConf.id;

		this.settings[id]=new Setting(settingConf);
	}

	/**
	 * Set the value of a setting.
	 *
	 * This function will set the value of the setting and store it
	 * in the database.
	 *
	 * @function async Server Functions.setSetting
	 * @param id:String The setting.
	 * @param value:Object The new value for the setting.
	 */
	setSetting=async (id, value, options={})=>{
		if (!this.settings[id])
			throw new Error("No such setting: "+id);

		this.settings[id].value=value;

		if (!options.local)
			await this.settings[id].save();

		this.katnip.serverChannels.notifyChannel(id);
	}

	loadSettings=async ()=>{
		for (let setting of await Setting.findMany()) {
			if (this.settings[setting.id])
				this.settings[setting.id].value=setting.value;

			else
				console.log("Unknown setting in db: "+setting.id);
		}
	}

	/**
	 * Get settings object matching query.
	 *
	 * This function gets the setting objects for the matching query.
	 * This function is intended for listing settings, if you just need
	 * the value of a setting, use the getSetting function.
	 *
	 * @function Server Functions.getSettings
	 * @param query:Object Query that should match the requested settings.
	 */
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

	/**
	 * Get settings categories matching query.
	 *
	 * This function gets all registered setting categories.
	 *
	 * @function Server Functions.getSettingCategories
	 */
	getSettingCategories=()=>{
		return this.categories;
	}

	/**
	 * Add a setting category.
	 *
	 * The cateogry can contain the following fields:
	 *
	 * * **title** - Title for the category as shown in the admin.
	 *
	 * @function Server Functions.addSettingCategory
	 * @param id:String The id for the setting category.
	 * @param category:Object Spec for the cateogry.
	 */
	addSettingCategory=(id, category={})=>{
		category.id=id;
		this.categories[id]=category;
	}
}