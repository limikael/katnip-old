import {pluggy} from "pluggy";
import {MenuEditor} from "./components.jsx";

pluggy.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Menus",
		href: "/admin/menus",
		priority: 40
	});
});

pluggy.addAction("getPageComponent",(request)=>{
	if (request.path=="/admin/menus")
		return MenuEditor;
});

