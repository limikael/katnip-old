import Model from "../orm/Model.js";
import {isServer} from "../utils/js-util.js";

class Setting extends Model {
	static tableName="Setting";

	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		key: "VARCHAR(255) NOT NULL",
		value: "TEXT"
	}
}

export default class CatnipSettings {
	constructor(db) {
		this.settings={};
		this.categories={};

		if (isServer())
			db.addModel(Setting);
	}

	getSetting=(id)=>{
		if (!this.settings[id])
			throw new Error("No such setting: "+id);

		return this.settings[id].value;
	}

	addSetting=(id, setting={})=>{
		setting.id=id;
		if (!setting.title)
			setting.title=setting.id;

		this.settings[id]=setting;
	}

	setSetting=async (id, value)=>{
		if (!this.settings[id])
			throw new Error("No such setting: "+key);

		this.settings[id].value=value;

		let setting=await Setting.findOne({key: id});
		if (!setting) {
			setting=new Setting()
			setting.key=id;
		}

		setting.value=JSON.stringify(this.settings[id].value);
		await setting.save();
	}

	loadSettings=async ()=>{
		for (let setting of await Setting.findMany()) 
			this.settings[setting.key].value=JSON.parse(setting.value);
	}

	getSettings=(q={})=>{
		let res=[];

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