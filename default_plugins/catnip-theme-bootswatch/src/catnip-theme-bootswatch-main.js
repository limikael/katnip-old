import catnip from "catnip";

catnip.addSetting("menuHeader");
catnip.addSetting("menuFooter");

catnip.addSetting("bootswatchTheme");
catnip.addSetting("bootswatchNavColor");
catnip.addSetting("bootswatchNavStyle");
catnip.addSetting("bootswatchFooter");

catnip.addAction("serverMain",async ()=>{
	if (!catnip.getSetting("sitename")) {
		console.log("No site name, setting...")
		await catnip.setSetting("sitename","My Site");
	}
});