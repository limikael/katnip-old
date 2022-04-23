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

pluggy.addApi("/api/getMenu",async ({setting})=>{
	return await pluggy.getSetting(setting);
});

pluggy.addApi("/api/saveMenu",async ({setting, value})=>{
	console.log(value);

//	return await pluggy.setSetting(setting, value);
});