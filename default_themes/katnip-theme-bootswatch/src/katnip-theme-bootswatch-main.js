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

katnip.addAction("getDefaultTemplateContent",()=>{
	return ([
		{"type": "BsPage", "props": {}, "children": [
			{"type": "BsPageNav", "props": {}, "children": []},
			{"type": "BsPageContent", "props": {}, "children": [
				{"type": "BsCenterContent", "props": {}, "children": [
					{"type": "BsTitle", "props": {}, "children": []},
					{"type": "TheContent", "props": {}, "children": []}
				]}
			]},
			{"type": "BsPageFooter", "props": {}, "children": [
				{"type": "div", "props": {"class": "p-3 text-center"}, "children": []}
			]}
		]}
	]);
});