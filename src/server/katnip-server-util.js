import fs from "fs";
import os from "os";
import path from "path";

export function	createOutDir() {
	return new Promise((resolve, reject)=>{
		let tmpDir=os.tmpdir();
		fs.mkdtemp(`${tmpDir}${path.sep}`, (err, folder) => {
			if (err)
				reject(err);

			else
				resolve(folder);
		});
	});
}

export function	getDirectories(source) {
	return fs.readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name)
}

export function	getPluginPaths() {
	let pkg=JSON.parse(fs.readFileSync("package.json"));
	let pluginsNames=pkg.plugins||[];
	let pluginPaths=[];

	if (pkg.main)
		pluginPaths.push(`${process.cwd()}`);

	for (let pluginName of pluginsNames)
		pluginPaths.push(`${process.cwd()}/node_modules/${pluginName}`);

	let defaultPlugins=getDirectories(`${process.cwd()}/node_modules/katnip/default_plugins/`);
	for (let defaultPlugin of defaultPlugins)
		pluginPaths.push(`${process.cwd()}/node_modules/katnip/default_plugins/${defaultPlugin}`);

	return pluginPaths;		
}
