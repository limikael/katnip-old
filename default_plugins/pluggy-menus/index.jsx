import {pluggy} from "pluggy";
import {MenuEditor} from "./components.jsx";
import MENU_DOWN from "bootstrap-icons/icons/menu-down.svg";

pluggy.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Menus",
		href: "/admin/menus",
		priority: 40,
		icon: MENU_DOWN
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
	return await pluggy.setSetting(setting,value);
});