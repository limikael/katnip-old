import {katnip, convertToSlug} from "katnip";
import "./katnip-pages-api.js";

class Page extends katnip.Model {
	static tableName="Page";

	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY",
		title: "TEXT NOT NULL",
		stamp: "INTEGER NOT NULL",
		content: "JSON NOT NULL",
		slug: "VARCHAR(255) NOT NULL",
		meta: "JSON"
	};
}

katnip.addModel(Page);
katnip.createCrudApi(Page,{
	cap: "manage-content",
	onsave: (item)=>{
		item.stamp=Date.now()/1000;
		item.slug=convertToSlug(item.title);
	},
	postsave: (item)=>{
		katnip.notifyChannel("pageContent",{id: item.id});
		katnip.notifyChannel("numPages");
	},
	postdelete: (item)=>{
		katnip.notifyChannel("pageContent",{id: item.id});
		katnip.notifyChannel("numPages");
	},
});

katnip.addAction("serverMain",async ()=>{
	if (!await Page.getCount()) {
		console.log("No pages, will create one...");
		let p=new Page({
			title: "Hello",
			content: [
				{type: "Paragraph", props: {}, children: ["Hello and welcome!"]},
				{type: "Paragraph", props: {}, children: ["This is a page..."]},
			],
			stamp: Date.now()/1000,
			slug: convertToSlug("Hello")
		});

		await p.save();

		if (!katnip.getSetting("homepath")) {
			console.log("Setting home path...");
			await katnip.setSetting("homepath","/page/hello");
		}
	}

	if (!katnip.getSetting("sitename")) {
		console.log("No site name, setting...")
		await katnip.setSetting("sitename","My Site");
	}
});