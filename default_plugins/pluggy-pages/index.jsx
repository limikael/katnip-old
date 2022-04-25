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
pluggy.createCrudApi(Page,{
	onsave: (item)=>{
		item.stamp=Date.now()/1000;
	}
});

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