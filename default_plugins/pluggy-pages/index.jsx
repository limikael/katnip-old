import pluggy from "pluggy";
import {PageView, PageAdmin} from "./components.jsx";

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
		href: "/admin/page",
		priority: 40
	});
});

pluggy.addAction("getPageComponent",(request)=>{
	if (request.path=="/admin/page")
		return PageAdmin;

	if (request.params[0]=="page")
		return PageView;
});

pluggy.addApi("/api/getAllPages",async ()=>{
	return pluggy.db.Page.findMany();
});

pluggy.addApi("/api/getPage",async ({id})=>{
	//console.log("geting page: "+id);
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

pluggy.addElement("PluggyEcho",({text,children})=>{
	//console.log("called..");

	return (
		<>
			<div>This is pluggy echo...{text}</div>
			<div class="card">
				{children}
			</div>
		</>
	);
});