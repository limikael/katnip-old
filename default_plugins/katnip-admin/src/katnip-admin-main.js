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
	for (let setting of catnip.getSettings({session: true}))
		clientSession[setting.id]=setting.value;
});
