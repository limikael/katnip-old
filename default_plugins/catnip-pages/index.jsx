import {catnip, convertToSlug, useChannel} from "catnip";
import {PageView, PageAdmin} from "./components.jsx";
import FILE_EARMARK_TEXT from "bootstrap-icons/icons/file-earmark-text.svg";

class Page extends catnip.Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
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

catnip.addApi("/api/getPageView",async ({query})=>{
	let page=await Page.findOne({
		$op: "or",
		slug: query,
		id: query
	});

	if (!page)
		throw new Error("NOT FOUND")

	return page;
})

catnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Pages",
		href: "/admin/page",
		priority: 40,
		icon: FILE_EARMARK_TEXT
	});
});

catnip.addRoute("admin/page",PageAdmin);
catnip.addRoute("page/*",PageView);

catnip.addElement("PluggyEcho",({text,children})=>{
	//console.log("called..");

	return (
		<>
			<div>This is catnip echo...{text}</div>
			<div class="card">
				{children}
			</div>
		</>
	);
});

catnip.addElement("NumPages",()=>{
	let info=useChannel("numPages");

	return (<>
		<span>Number of pages: {info}</span>
	</>);
});

catnip.addChannel("numPages",async ()=>{
	return await catnip.db.Page.getCount();
});

catnip.addChannel("pageContent",async ({id})=>{
	return await catnip.db.Page.findOne(id);
});