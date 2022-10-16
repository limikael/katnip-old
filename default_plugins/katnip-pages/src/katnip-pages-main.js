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
				{type: "p", props: {}, children: [
					"Welcome to Katnip!"
				]},
				{type: "p", props: {}, children: [
					"If you can see this page, it means that Katnip is installed and up and running. "
				]},
				{type: "p", props: {}, children: [
					{type: "b", props: {}, children: ["Congratulations!"]},
				]},
				{type: "p", props: {}, children: [
					"This page is, in fact, you home page. Your mission now is to personalise it!"
				]},
				{type: "p", props: {}, children: [
					"So, head over to the ",
					{type: "a", props: {href: "/admin"}, children: ["admin"]},
					", and start creating!"
				]},
				{type: "p", props: {}, children: [
					"Also, let me express my heartfelt gratitude that you are willing to give this a go!"
				]},
			],
			stamp: Date.now()/1000,
			slug: convertToSlug("Hello"),
			meta: {}
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