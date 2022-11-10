import {katnip} from "katnip";
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
			name: plugin,
			description: pluginPkg.description
		});
	}

	return pluginsRes;
});