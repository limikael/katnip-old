import fs from "fs";
import os from "os";
import path from "path";
import {build} from "../utils/esbuild-extra.js";

export default class KatnipPluginLoader {
	constructor(katnip) {
		this.katnip=katnip;
		this.cwd=process.cwd();
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

	async loadPlugins() {
		this.plugins=[];
		for (let path of this.getPluginPaths()) {
			//console.log("Plugin: "+path);
			this.plugins.push(await import(this.resolveMainFile(path)));
		}
	}

	linkAlias(pkg, target) {
		if (!fs.existsSync(`node_modules/${pkg}`))
			fs.symlinkSync("preact/compat",`node_modules/${pkg}`,"dir");

		let stat=fs.lstatSync(`node_modules/${pkg}`);
		if (!stat.isSymbolicLink())
			throw new Error(`${pkg} is not a link`);
	}

	resolveMainFile(packageDir) {
		let pkg=JSON.parse(fs.readFileSync(packageDir+"/package.json"));
		return packageDir+"/"+pkg.main;
	}

	getDirectories(source) {
		return fs.readdirSync(source, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name)
	}

	getPluginPaths() {
		let paths=[];

		paths.push(this.cwd+"/.");
		paths.push(this.cwd+"/node_modules/katnip");

		for (let subdir of this.getDirectories(this.cwd+"/node_modules/katnip/default_plugins"))
			paths.push(this.cwd+"/node_modules/katnip/default_plugins/"+subdir);

		let pkg=JSON.parse(fs.readFileSync(this.cwd+"/package.json"));
		if (pkg["plugins"])
			for (let plugin of pkg["plugins"])
				paths.push(this.cwd+"/node_modules/"+plugin);

		return paths;
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
				include: this.getPluginPaths(),
				inject: ["node_modules/katnip/src/utils/preact-shim.js"],
				jsxFactory: "h",
				jsxFragment: "Fragment",
				minify: options.minify,
				outfile: this.outDir+"/katnip-bundle.mjs",
				loader: {".svg": "dataurl"},
				sourcemap: true,
				format: "esm"
			});
		}

		catch (e) {
			console.log("Build failed: "+e.message);
			process.exit();
		}

		this.clientModule=await import(this.outDir+"/katnip-bundle.mjs");

		console.log("Build done...");
	}
}