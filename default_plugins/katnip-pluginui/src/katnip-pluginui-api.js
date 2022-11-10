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