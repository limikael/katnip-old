import {katnip, lazyComponent} from "katnip";
import PLUGIN from "bootstrap-icons/icons/plugin.svg";

katnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Plugins",
		href: "/admin/plugin",
		priority: 80,
		icon: PLUGIN
	});

	items.push({
		title: "Themes",
		href: "/admin/theme",
		priority: 85,
		icon: PLUGIN
	});
});

katnip.addRoute("admin/plugin",lazyComponent("admin","PluginAdmin"));
katnip.addRoute("admin/theme",lazyComponent("admin","ThemeAdmin"));
