import {catnip} from "catnip";
import MenuEditor from "../components/MenuEditor.jsx";
import MENU_DOWN from "bootstrap-icons/icons/menu-down.svg";

catnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Menus",
		href: "/admin/menus",
		priority: 40,
		icon: MENU_DOWN
	});
});

catnip.addRoute("admin/menus",MenuEditor);