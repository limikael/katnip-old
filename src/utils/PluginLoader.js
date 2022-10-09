export default class PluginLoader {
	getPluginPaths() {
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

	resolveMainFile(packageDir) {
		let pkg=JSON.parse(fs.readFileSync(packageDir+"/package.json"));
		return packageDir+"/"+pkg.main;
	}
}