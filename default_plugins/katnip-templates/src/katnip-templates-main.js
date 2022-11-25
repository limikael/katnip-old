import {katnip, Model} from "katnip";
import "./katnip-templates-api.js";

class Term extends Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY",
		taxonomy: "VARCHAR(255) NOT NULL",
		title: "VARCHAR(255) NOT NULL",
		parentTermId: "INTEGER"
	}
}

katnip.addModel(Term);

class Template extends katnip.Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY",
		title: "TEXT NOT NULL",
		content: "JSON NOT NULL",
		routes: "TEXT NOT NULL",
		meta: "JSON",
	};
}

katnip.addModel(Template);
katnip.createCrudApi(Template,{
	cap: "manage-content",
	postsave: ()=>{
		katnip.notifyChannel("templates");
	}
});

katnip.addAction("getPluginBundles",(bundles)=>{
	bundles.admin.push("katnip-templates/components/TaxonomyAdmin.jsx");
	bundles.admin.push("katnip-templates/components/TemplateAdmin.jsx");
});

katnip.addChannel("templates",async ()=>{
	return await Template.findMany();
});

katnip.addAction("initChannels",(channelIds)=>{
	channelIds.push("templates");
});