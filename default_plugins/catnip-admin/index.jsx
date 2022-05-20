import catnip from "catnip";
import AdminTemplate from "./components/AdminTemplate.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Settings from "./components/Settings.jsx";
import SPEEDOMETER from "bootstrap-icons/icons/speedometer.svg";
import EYEGLASSES from "bootstrap-icons/icons/eyeglasses.svg";
import GEAR from "bootstrap-icons/icons/gear.svg";

catnip.addTemplate("admin/**",AdminTemplate);

catnip.addRoute("admin",Dashboard);
catnip.addRoute("admin/settings/**",Settings);

catnip.addSetting("sitename",{title: "Site Name", category: "settings", session: true});
catnip.addSetting("homepath",{title: "Homepage Route", category: "settings", session: true});
catnip.addSetting("postloginpath",{title: "Post Login Route", category: "settings", session: true});

catnip.addSettingCategory("settings",{title: "Settings", priority: 10});

catnip.addAction("getAdminMenu",(items)=>{
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

function Hello({request}) {
	return (<>Hello</>)
}

catnip.addApi("/api/getSettings",async ({category},sreq)=>{
	sreq.assertCap("manage-settings");
	let res={};

	for (let setting of catnip.getSettings({category: category}))
		res[setting.id]=setting.value;

	return res;
});

catnip.addApi("/api/saveSettings",async (settings, sreq)=>{
	sreq.assertCap("manage-settings");
	for (let k in settings)
		await catnip.setSetting(k,settings[k]);
});

catnip.addAction("getClientSession",async (clientSession)=>{
	let menuLocations=[];
	catnip.doAction("getMenuLocations",menuLocations);

	for (let k of menuLocations)
		clientSession[k.setting]=catnip.getSetting(k.setting);

	let customizerOptions=[];
	catnip.doAction("getCustomizerOptions",customizerOptions);

	for (let k of customizerOptions)
		clientSession[k.setting]=catnip.getSetting(k.setting);

	for (let setting of catnip.getSettings({session: true}))
		clientSession[setting.id]=setting.value;

/*	clientSession["sitename"]=catnip.getSetting("sitename");
	clientSession["homepath"]=catnip.getSetting("homepath");*/
});
