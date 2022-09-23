import {catnip, convertToSlug} from "catnip";
import "./catnip-pages-api.js";

class Page extends catnip.Model {
	static tableName="Page";

	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY",
		title: "TEXT NOT NULL",
		stamp: "INTEGER NOT NULL",
		content: "TEXT NOT NULL",
		slug: "VARCHAR(255) NOT NULL"
	};
}

catnip.addModel(Page);
catnip.createCrudApi(Page,{
	cap: "manage-content",
	onsave: (item)=>{
		item.stamp=Date.now()/1000;
		item.slug=convertToSlug(item.title);
	},
	postsave: (item)=>{
		catnip.notifyChannel("pageContent",{id: item.id});
		catnip.notifyChannel("numPages");
	},
	postdelete: (item)=>{
		catnip.notifyChannel("pageContent",{id: item.id});
		catnip.notifyChannel("numPages");
	},
});

catnip.addAction("serverMain",async ()=>{
	if (!await Page.getCount()) {
		console.log("No pages, will create one...");
		let p=new Page({
			title: "Hello",
			content: "<p>Hello and welcome!</p><p>This is a page...</p>",
			stamp: Date.now()/1000,
			slug: convertToSlug("Hello")
		});

		await p.save();

		if (!catnip.getSetting("homepath")) {
			console.log("Setting home path...");
			await catnip.setSetting("homepath","/page/hello");
		}
	}

	if (!catnip.getSetting("sitename")) {
		console.log("No site name, setting...")
		await catnip.setSetting("sitename","My Site");
	}
});