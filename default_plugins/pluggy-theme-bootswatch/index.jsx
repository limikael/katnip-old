import pluggy from "pluggy";
import {PageTemplate} from "./components.jsx";

pluggy.addAction("getMenuLocations",(items)=>{
	items.push({
		title: "Header Menu",
		setting: "menuHeader"
	});

	items.push({
		title: "Footer Menu",
		setting: "menuFooter"
	});
})

pluggy.addAction("getCustomizerOptions",(items)=>{
	let themes=[
		"cerulean", "cosmo", "cyborg", "darkly", "flatly",
		"journal", "litera", "lumen", "lux", "materia",
		"minty", "morph", "pulse", "quartz", "sandstone",
		"simplex", "sketchy", "slate", "solar", "spacelab",
		"superhero", "united", "vapor", "yeti", "zephyr"
	];

	let themeOptions={};
	for (let theme of themes)
		themeOptions[theme]=theme[0].toUpperCase()+theme.substring(1);

	items.push({
		title: "Bootswatch Theme",
		setting: "bootswatchTheme",
		type: "select",
		options: themeOptions
	});

/*	items.push({
		title: "Hello",
		setting: "hello"
	});*/
});

pluggy.addAction("getPageTemplate",(request)=>{
	if (request.params[0]!="admin")
		return PageTemplate;
});
