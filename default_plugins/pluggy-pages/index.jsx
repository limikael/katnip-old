import pluggy from "pluggy";
import {ListPages, EditPage, PageView} from "./components.jsx";

class Page extends pluggy.Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		title: "TEXT NOT NULL",
		stamp: "INTEGER NOT NULL",
		content: "TEXT NOT NULL"
	};
}

pluggy.addModel(Page);

pluggy.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Pages",
		href: "/admin/pages",
		routes: ["/admin/page"],
		priority: 40
	});
});

pluggy.addAction("getPageComponent",(request)=>{
	if (request.path=="/admin/page")
		return EditPage;

	if (request.path=="/admin/pages")
		return ListPages;

	if (request.params[0]=="page")
		return PageView;
});

pluggy.addApi("/api/getAllPages",async ()=>{
	return pluggy.db.Page.findMany();
});

pluggy.addApi("/api/getPage",async ({id})=>{
	return pluggy.db.Page.findOne({id: id});
});

pluggy.addApi("/api/savePage",async ({id, title, content})=>{
	let p;

	if (id)
		p=await pluggy.db.Page.findOne({id: id});

	else
		p=new pluggy.db.Page();

	p.title=title;
	p.content=content;
	p.stamp=Date.now()/1000;

	await p.save();

	return {id: p.id};
});

pluggy.addApi("/api/deletePage",async ({id})=>{
	let p=await pluggy.db.Page.findOne({id: id});
	await p.delete();
});
