import {katnip, uninstallPackage, getProjectDir, arrayRemove} from "katnip";
import fs from "fs";

katnip.addApi("/api/getInstalledPlugins",async ({},req)=>{
	req.assertCap("manage-settings");

	let pkg=JSON.parse(fs.readFileSync(process.cwd()+"/package.json"));
	let plugins=pkg.plugins;
	if (!plugins)
		plugins=[];

	let pluginsRes=[];
	for (let plugin of plugins) {
		let pluginPkg=JSON.parse(fs.readFileSync(process.cwd()+"/node_modules/"+plugin+"/package.json"));

		pluginsRes.push({
			id: plugin,
			name: plugin,
			description: pluginPkg.description
		});
	}

	return pluginsRes;
});

katnip.addApi("/api/removePlugin",async ({plugin},req)=>{
	req.assertCap("manage-settings");

	let pkg=JSON.parse(fs.readFileSync(getProjectDir()+"/package.json"));
	arrayRemove(pkg.plugins,plugin);
	fs.writeFileSync(getProjectDir()+"/package.json",JSON.stringify(pkg,null,2));

	await katnip.uninstallPackage(plugin);
	await katnip.restart();
});

katnip.addApi("/api/addPlugin",async ({plugin},req)=>{
	req.assertCap("manage-settings");

	await katnip.installPackage(plugin);

	let pkg=JSON.parse(fs.readFileSync(getProjectDir()+"/package.json"));
	if (!pkg.plugins)
		pkg.plugins=[];
	pkg.plugins.push(plugin);
	fs.writeFileSync(getProjectDir()+"/package.json",JSON.stringify(pkg,null,2));
	await katnip.restart();
});

function getDirectories(source) {
	return fs.readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name)
}

function findThemes(a, parentDir) {
	for (let theme of getDirectories(parentDir)) {
		let pkgFileName=parentDir+"/"+theme+"/package.json";
		if (fs.existsSync(pkgFileName)) {
			let pkg=JSON.parse(fs.readFileSync(pkgFileName));
			if (pkg.keywords && pkg.keywords.includes("katnip-theme")) {
				a.push({
					id: theme,
					name: theme,
					description: pkg.description
				});
			}
		}
	}
}

katnip.addApi("/api/getInstalledThemes",async ({},req)=>{
	req.assertCap("manage-settings");

	let pkg=JSON.parse(fs.readFileSync(process.cwd()+"/package.json"));
	let theme="katnip-theme-bootswatch";
	if (pkg.hasOwnProperty("theme"))
		theme=pkg.theme;

	if (!theme)
		theme="null";

	let themesRes=[];
	themesRes.push({
		id: "null",
		name: "null",
		description: "Disable Theme Functionality"
	});

	findThemes(themesRes,process.cwd()+"/node_modules/katnip/default_themes");
	findThemes(themesRes,process.cwd()+"/node_modules/");

	for (let t of themesRes)
		if (t.name==theme)
			t.active=true;

	return themesRes;
});

katnip.addApi("/api/activateTheme",async ({theme},req)=>{
	req.assertCap("manage-settings");

	if (theme=="null")
		theme=null;

	let pkg=JSON.parse(fs.readFileSync(getProjectDir()+"/package.json"));
	pkg.theme=theme;
	fs.writeFileSync(getProjectDir()+"/package.json",JSON.stringify(pkg,null,2));
	await katnip.restart();
});
