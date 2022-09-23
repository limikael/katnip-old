import katnip from "katnip";
import BootswatchPageTemplate from "../components/BootswatchPageTemplate.jsx";

katnip.addTemplate("**",BootswatchPageTemplate);

katnip.addAction("getMenuLocations",(items)=>{
	items.push({
		title: "Header Menu",
		setting: "menuHeader"
	});

	items.push({
		title: "Footer Menu",
		setting: "menuFooter"
	});
})

katnip.addAction("getCustomizerOptions",(items)=>{
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

	items.push({
		title: "Nav Color",
		setting: "bootswatchNavColor",
		type: "select",
		options: {
			primary: "Primary",
			secondary: "Secondary",
			light: "Light",
			dark: "Dark"
		}
	});

	items.push({
		title: "Nav Style",
		setting: "bootswatchNavStyle",
		type: "select",
		options: {
			static: "Static",
			fixed: "Fixed"
		}
	});

	items.push({
		title: "Footer",
		setting: "bootswatchFooter",
		type: "select",
		options: {
			dark: "Dark",
			light: "Light",
			black: "Black",
			transparent: "Transparent",
			none: "None"
		}
	});
});
