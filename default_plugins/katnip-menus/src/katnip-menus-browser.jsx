import {katnip} from "katnip";
import MenuEditor from "../components/MenuEditor.jsx";
import MENU_DOWN from "bootstrap-icons/icons/menu-down.svg";

katnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Menus",
		href: "/admin/menus",
		priority: 40,
		icon: MENU_DOWN
	});
});

katnip.addRoute("admin/menus",MenuEditor);