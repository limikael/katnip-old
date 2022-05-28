import catnip from "catnip";

catnip.addSetting("menuHeader",{session: true});
catnip.addSetting("menuFooter",{session: true});

catnip.addSetting("bootswatchTheme",{session: true});
catnip.addSetting("bootswatchNavColor",{session: true});
catnip.addSetting("bootswatchNavStyle",{session: true});
catnip.addSetting("bootswatchFooter",{session: true});

catnip.addAction("serverMain",async ()=>{
	if (!catnip.getSetting("sitename")) {
		console.log("No site name, setting...")
		await catnip.setSetting("sitename","My Site");
	}
});