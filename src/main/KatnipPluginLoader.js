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
			fs.symlinkSync(target,`node_modules/${pkg}`,"dir");

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

		paths.push(this.cwd+"/node_modules/katnip");

		for (let subdir of this.getDirectories(this.cwd+"/node_modules/katnip/packages")) {
			let pkg=JSON.parse(fs.readFileSync(this.cwd+"/node_modules/katnip/packages/"+subdir+"/package.json"));

			if (pkg.keywords.includes("katnip-plugin"))
				paths.push(this.cwd+"/node_modules/katnip/packages/"+subdir);
		}

		let pkg=JSON.parse(fs.readFileSync(this.cwd+"/package.json"));
		if (pkg["plugins"])
			for (let plugin of pkg["plugins"])
				paths.push(this.cwd+"/node_modules/"+plugin);

		let theme="katnip-theme-bootswatch";
		if (pkg.hasOwnProperty("theme"))
			theme=pkg.theme;

		if (theme) {
			if (fs.existsSync(this.cwd+"/node_modules/katnip/packages/"+theme))
				paths.push(this.cwd+"/node_modules/katnip/packages/"+theme);

			else
				paths.push(this.cwd+"/node_modules/"+theme);
		}

		paths.push(this.cwd+"/.");

		return paths;
	}

	resolveBundleFile(fn) {
		if (fs.existsSync(this.cwd+"/node_modules/"+fn))
			return this.cwd+"/node_modules/"+fn;

		if (fs.existsSync(this.cwd+"/node_modules/katnip/packages/"+fn))
			return this.cwd+"/node_modules/katnip/packages/"+fn

		throw new Error("Unable to resolve bundle file: "+fn);
	}

	async buildClientBundle(pluginBundles, options={}) {
		options.minify=!!options.minify;

		for (let k in pluginBundles)
			for (let i=0; i<pluginBundles[k].length; i++)
				pluginBundles[k][i]=this.resolveBundleFile(pluginBundles[k][i]);

		pluginBundles["katnip-bundle"]=[];
		for (let pluginPath of this.getPluginPaths()) {
			let pkg=JSON.parse(fs.readFileSync(pluginPath+"/package.json"));
			if (pkg.browser)
				pluginBundles["katnip-bundle"].push(pluginPath);
		}

		this.outDir=await this.createOutDir();
		console.log("Building in: "+this.outDir+" minify: "+options.minify);

		for (let k in pluginBundles)
			console.log("- "+k+": "+pluginBundles[k].length+" entrypoint(s).");

		let stat=fs.lstatSync(this.cwd+"/node_modules/katnip");
		let realCwd=fs.realpathSync(this.cwd);
		let realKatnip=fs.realpathSync(this.cwd+"/node_modules/katnip");

		if (stat.isSymbolicLink() &&
				realCwd!=realKatnip) {
			console.log("Katnip is linked, setting up dependency links...");
			fs.rmSync(this.cwd+"/node_modules/preact",{recursive: true, force: true});
			fs.rmSync(this.cwd+"/node_modules/react",{recursive: true, force: true});
			fs.rmSync(this.cwd+"/node_modules/react-dom",{recursive: true, force: true});

			let l=fs.readlinkSync(this.cwd+"/node_modules/katnip");
			fs.symlinkSync(l+"/node_modules/preact","node_modules/preact","dir");
			fs.symlinkSync(l+"/node_modules/preact/compat","node_modules/react","dir");
			fs.symlinkSync(l+"/node_modules/preact/compat","node_modules/react-dom","dir");
		}

		else {
			this.linkAlias("react","preact/compat");
			this.linkAlias("react-dom","preact/compat");
		}

		try {
			await build({
				namedMultiBundles: pluginBundles,
				inject: ["node_modules/katnip/src/utils/preact-shim.js"],
				outdir: this.outDir,
				jsxFactory: "h",
				jsxFragment: "Fragment",
				minify: options.minify,
				loader: {".svg": "dataurl"},
				splitting: true,
				sourcemap: true,
				format: "esm"
			});
		}

		catch (e) {
			console.log("Build failed: "+e.message);
			process.exit();
		}

		if (options.ssr) {

			// uuuh this is so ugly, but needed for popper...
			global.document=global.window={addEventListener: ()=>{}};

			this.clientModule=await import(this.outDir+"/katnip-bundle.mjs");

			delete global.window;
			delete global.document;
		}

		console.log("Build done...");
	}

	getBundleFiles() {
		return fs.readdirSync(this.outDir,{withFileTypes: true})
			.filter(dirent => dirent.isFile())
			.map(dirent => dirent.name)
	}

	getProjectDir=()=>{
		return this.cwd;
	}
}