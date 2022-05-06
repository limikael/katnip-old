import {catnip} from "catnip";
import {MenuEditor} from "./components.jsx";
import MENU_DOWN from "bootstrap-icons/icons/menu-down.svg";

catnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Menus",
		href: "/admin/menus",
		priority: 40,
		icon: MENU_DOWN
	});
});

catnip.addAction("getPageComponent",(request)=>{
	if (request.path=="/admin/menus")
		return MenuEditor;
});

catnip.addApi("/api/getMenu",async ({setting})=>{
	return await catnip.getSetting(setting);
});

catnip.addApi("/api/saveMenu",async ({setting, value}, sreq)=>{
	sreq.assertCap("manage-settings");
	return await catnip.setSetting(setting,value);
});