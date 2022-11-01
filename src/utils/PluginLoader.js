import fs from "fs";
import os from "os";
import path from "path";
import {build} from "./esbuild-extra.js";

export default class PluginLoader {
	constructor() {
		this.pluginPaths=[];
		this.exposePaths={};
		this.cwd=process.cwd();
		this.inject=[];

		this.bundleName="bundle.js";
	}

	getPluginPaths() {
		return this.pluginPaths;
	}

	getDirectories(source) {
		return fs.readdirSync(source, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name)
	}

	setBundleName(name) {
		this.bundleName=name;
	}

	addPluginSpecifier(specifier) {
		let pkg=JSON.parse(fs.readFileSync("package.json"));
		if (pkg[specifier])
			for (let plugin of pkg[specifier])
				this.addPlugin("node_modules/"+plugin);
	}

	addPluginPath(dir) {
		for (let p of this.getDirectories(`${this.cwd}/${dir}`))
			this.addPlugin(dir+"/"+p);
	}

	addPlugin(plugin) {
		this.pluginPaths.push(this.cwd+"/"+plugin);
	}

	addExposePlugin(name, plugin) {
		this.exposePaths[name]=this.cwd+"/"+plugin;
	}

	addInject(file) {
		this.inject.push(this.cwd+"/"+file);
	}

	resolveMainFile(packageDir) {
		let pkg=JSON.parse(fs.readFileSync(packageDir+"/package.json"));
		return packageDir+"/"+pkg.main;
	}

	linkAlias(pkg, target) {
		if (!fs.existsSync(`node_modules/${pkg}`))
			fs.symlinkSync("preact/compat",`node_modules/${pkg}`,"dir");

		let stat=fs.lstatSync(`node_modules/${pkg}`);
		if (!stat.isSymbolicLink())
			throw new Error(`${pkg} is not a link`);
	}

	async loadPlugins() {
		this.plugins=[];
		for (let path of this.pluginPaths) {
			//console.log("Plugin: "+path);
			this.plugins.push(await import(this.resolveMainFile(path)));
		}
	}

	createOutDir() {
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

	async buildClientBundle(options={}) {
		options.minify=!!options.minify;

		this.outDir=await this.createOutDir();
		console.log("Building in: "+this.outDir+" minify: "+options.minify);

		this.linkAlias("react","preact/compat");
		this.linkAlias("react-dom","preact/compat");

		try {
			await build({
				multiBundle: true,
				include: this.pluginPaths,
				expose: this.exposePaths,
				inject: this.inject,
				jsxFactory: "h",
				jsxFragment: "Fragment",
				minify: options.minify,
				outfile: this.outDir+"/"+this.bundleName,
				loader: {".svg": "dataurl"},
				sourcemap: true,
				format: "esm"
			});
		}

		catch (e) {
			console.log("Build failed: "+e.message);
			process.exit();
		}

		console.log("Build done...");

		return this.outDir;
	}
}