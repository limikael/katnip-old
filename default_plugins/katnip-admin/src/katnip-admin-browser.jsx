import {katnip, lazyComponent} from "katnip";
import SPEEDOMETER from "bootstrap-icons/icons/speedometer.svg";
import EYEGLASSES from "bootstrap-icons/icons/eyeglasses.svg";
import GEAR from "bootstrap-icons/icons/gear.svg";

katnip.addTemplate("admin/**",lazyComponent("admin","AdminTemplate"));

katnip.addRoute("admin",lazyComponent("admin","Dashboard"));
katnip.addRoute("admin/settings/**",lazyComponent("admin","Settings"));

katnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Dashboard",
		href: "/admin",
		priority: 10,
		icon: SPEEDOMETER
	});

	items.push({
		title: "Customize",
		href: "/admin/customize",
		priority: 15,
		icon: EYEGLASSES
	});

	items.push({
		title: "Settings",
		href: "/admin/settings",
		priority: 100,
		icon: GEAR
	});
});

