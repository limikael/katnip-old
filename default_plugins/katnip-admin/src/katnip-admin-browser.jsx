import katnip from "katnip";
import AdminTemplate from "../components/AdminTemplate.jsx";
import Dashboard from "../components/Dashboard.jsx";
import Settings from "../components/Settings.jsx";
import SPEEDOMETER from "bootstrap-icons/icons/speedometer.svg";
import EYEGLASSES from "bootstrap-icons/icons/eyeglasses.svg";
import GEAR from "bootstrap-icons/icons/gear.svg";

katnip.addTemplate("admin/**",AdminTemplate);

katnip.addRoute("admin",Dashboard);
katnip.addRoute("admin/settings/**",Settings);

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
