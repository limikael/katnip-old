import http from "http";
import esbuild from "esbuild";
import fs from "fs";
import os from "os";
import path from "path";

export default class PluggyServer {
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

	getDirectories(source) {
		return fs.readdirSync(source, { withFileTypes: true })
			.filter(dirent => dirent.isDirectory())
			.map(dirent => dirent.name)
	}

	getPluginPaths() {
		let pkg=JSON.parse(fs.readFileSync("package.json"));
		let pluginsNames=pkg.plugins||[];
		let pluginPaths={};

		for (let pluginName of pluginsNames)
			pluginPaths[pluginName]=`${process.cwd()}/node_modules/${pluginName}`;

		let defaultPlugins=this.getDirectories(`${process.cwd()}/node_modules/pluggy/default_plugins/`);
		for (let defaultPlugin of defaultPlugins)
			pluginPaths[defaultPlugin]=`${process.cwd()}/node_modules/pluggy/default_plugins/${defaultPlugin}`

		return pluginPaths;		
	}

	async buildPluginBundle(options) {
		let pluginPaths=this.getPluginPaths();
		let imp="";
		let exp="";

		let i=0;
		for (let pluginName in pluginPaths) {
			imp+=`import * as plugin_${i} from "${pluginPaths[pluginName]}";\n`;
			exp+=`"${pluginName}": plugin_${i},\n`;
			i++;
		}

		let s=`${imp}\nlet pluggyPlugins={\n${exp}};\n`;
		s+="if (typeof window!=='undefined') window.pluggyPlugins=pluggyPlugins; \n";
		s+="if (typeof global!=='undefined') global.pluggyPlugins=pluggyPlugins; \n";

		s+=`import pluggy from "${process.cwd()}/node_modules/pluggy";\n`;
		s+="if (typeof window!=='undefined') window.pluggy=pluggy; \n";
		s+="if (typeof global!=='undefined') global.pluggy=pluggy; \n";

		if (options.includeClient) {
			s+=`import "${process.cwd()}/node_modules/pluggy/src/main/pluggy-client.jsx"\n`;
			delete options.includeClient;

			options.inject=[
				`${process.cwd()}/node_modules/pluggy/src/utils/preact-shim.js`
			];
		}

		fs.writeFileSync(this.outDir+"/plugins.js",s);

		options.entryPoints=[this.outDir+"/plugins.js"]

		await esbuild.build(options);
	}

	handlePublic(req, res) {
		let pluginPaths=this.getPluginPaths();

		for (let pluginName in pluginPaths) {
			let cand=pluginPaths[pluginName]+"/"+req.url;

			if (fs.existsSync(cand)) {
				res.writeHead(200);
				res.end(fs.readFileSync(cand));
				return;
			}
		}

		res.writeHead(404);
		res.end("Not found...");
	}

	handleApi=async (req, res)=>{
		let l=new URL(req.url,"http://example.com");
		let query=Object.fromEntries(new URLSearchParams(l.search));
		let params=l.pathname.split("/").filter(s=>s.length>0);
		let path="/"+params.join("/");

		if (params.length!=2) {
			res.writeHead(404);
			res.end("Malformed...");
			return;
		}

		let apiFunctionName=params[1];
		let plugins=this.pluggy.getPlugins();
		for (let pluginName in plugins) {
			if (plugins[pluginName].api) {
				let func=plugins[pluginName].api[apiFunctionName];
				if (func) {
					try {
						let data=await func(query);
						res.writeHead(200);
						res.end(JSON.stringify(data));
						return;
					}

					catch (e) {
						console.log(e);
						res.writeHead(500);
						res.end("Error...");
						return;
					}
				}
			}
		}

		res.writeHead(404);
		res.end("Not found...");
	}

	handleRequest=(req, res)=>{
		if (req.url=="/pluggy-bundle.js") {
			res.writeHead(200);
			res.end(this.clientBundle);
		}

		else if (req.url.startsWith("/api/"))
			this.handleApi(req,res);

		else if (req.url.startsWith("/public/"))
			this.handlePublic(req,res);

		else {
			res.writeHead(200);
			res.end(this.clientPage);
		}
	}

	async run() {
		this.outDir=await this.createOutDir();
		console.log("Building in: "+this.outDir);

		await this.buildPluginBundle({
			bundle: true,
			outfile: this.outDir+"/server-pluggy-bundle.js",
			external: ["mysql"]
		});

		await import(this.outDir+"/server-pluggy-bundle.js");
		this.pluggy=global.pluggy;

		await this.buildPluginBundle({
			bundle: true,
			outfile: this.outDir+"/pluggy-bundle.js",
			includeClient: true,
			jsxFactory: "h",
			jsxFragment: "Fragment",
			minify: true,
			external: ["mysql"]
		});

		this.clientBundle=fs.readFileSync(this.outDir+"/pluggy-bundle.js");
		this.clientPage=`<body><html><div id="pluggy-root"></div><script src="/pluggy-bundle.js"></script></html></body>`;

		this.pluggy.db.connection.MySql=await import("mysql");
		await this.pluggy.db.install();
//		console.log(this.pluggy.db);

		this.pluggy.doAction("start");
		this.pluggy.doAction("serverStart");

		let server=http.createServer(this.handleRequest);
		server.listen(3000,"localhost",()=>{
			console.log("Running...");
		});
	}
}