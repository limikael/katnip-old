import katnip from "katnip";

katnip.addSetting("menuHeader",{session: true});
katnip.addSetting("menuFooter",{session: true});

katnip.addSetting("bootswatchTheme",{session: true});
katnip.addSetting("bootswatchNavColor",{session: true});
katnip.addSetting("bootswatchNavStyle",{session: true});
katnip.addSetting("bootswatchFooter",{session: true});

katnip.addAction("serverMain",async ()=>{
	if (!katnip.getSetting("sitename")) {
		console.log("No site name, setting...")
		await katnip.setSetting("sitename","My Site");
	}
});