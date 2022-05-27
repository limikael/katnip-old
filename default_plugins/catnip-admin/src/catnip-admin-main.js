import catnip from "catnip";
import "./catnip-admin-api.js";

catnip.addSettingCategory("settings",{
	title: "Settings",
	priority: 10
});

catnip.addSetting("sitename",{
	title: "Site Name",
	category: "settings",
	session: true
});

catnip.addSetting("homepath",{
	title: "Homepage Route",
	category: "settings",
	session: true
});

catnip.addSetting("postloginpath",{
	title: "Post Login Route",
	category: "settings",
	session: true
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
});
