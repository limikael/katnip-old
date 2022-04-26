import pluggy from "pluggy";
import AdminTemplate from "./components/AdminTemplate.jsx";
import Settings from "./components/Settings.jsx";
import SPEEDOMETER from "bootstrap-icons/icons/speedometer.svg";
import EYEGLASSES from "bootstrap-icons/icons/eyeglasses.svg";
import GEAR from "bootstrap-icons/icons/gear.svg";

pluggy.addAction("getPageTemplate",(request)=>{
	if (request.params[0]=="admin")
		return AdminTemplate;
});


pluggy.addAction("getAdminMenu",(items)=>{
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

pluggy.addAction("getPageComponent",(request)=>{
	if (request.path=="/admin")
		return Hello;

	if (request.path=="/admin/settings")
		return Settings;
});

pluggy.addApi("/api/saveSettings",async (settings)=>{
	for (let k in settings)
		await pluggy.setSetting(k,settings[k]);
});

pluggy.addAction("getClientSession",async (clientSession)=>{
	let menuLocations=[];
	pluggy.doAction("getMenuLocations",menuLocations);

	for (let k of menuLocations)
		clientSession[k.setting]=pluggy.getSetting(k.setting);

	let customizerOptions=[];
	pluggy.doAction("getCustomizerOptions",customizerOptions);

	for (let k of customizerOptions)
		clientSession[k.setting]=pluggy.getSetting(k.setting);

	clientSession["sitename"]=pluggy.getSetting("sitename");
	clientSession["homepath"]=pluggy.getSetting("homepath");
});
