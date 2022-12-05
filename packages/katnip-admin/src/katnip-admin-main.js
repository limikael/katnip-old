import katnip from "katnip";
import "./katnip-admin-api.js";

katnip.addSettingCategory("settings",{
	title: "Settings",
	priority: 10
});

katnip.addSetting("sitename",{
	title: "Site Name",
	category: "settings",
	session: true
});

katnip.addSetting("homepath",{
	title: "Homepage Route",
	category: "settings",
	session: true
});

katnip.addSetting("postloginpath",{
	title: "Post Login Route",
	category: "settings",
	session: true
});

katnip.addAction("getClientSession",async (clientSession)=>{
	for (let setting of katnip.getSettings({session: true}))
		clientSession[setting.id]=setting.value;
});

katnip.addAction("getPluginBundles",(bundles)=>{
	bundles.admin.push("katnip-admin/components/AdminTemplate.jsx");
	bundles.admin.push("katnip-admin/components/Dashboard.jsx");
	bundles.admin.push("katnip-admin/components/Settings.jsx");
});
