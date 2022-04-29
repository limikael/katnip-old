import http from "http";
import {build} from "../utils/esbuild-extra.js";
import fs from "fs";
import os from "os";
import path from "path";
import {v4 as uuidv4} from 'uuid';
import {quoteAttr} from "../utils/js-util.js";

export default class CatnipServer {
	constructor(options) {
		this.options=options;
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

		let defaultPlugins=this.getDirectories(`${process.cwd()}/node_modules/catnip/default_plugins/`);
		for (let defaultPlugin of defaultPlugins)
			pluginPaths[defaultPlugin]=`${process.cwd()}/node_modules/catnip/default_plugins/${defaultPlugin}`;

		return pluginPaths;		
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

	handleApi=async (req, res, sessionId)=>{
		//await delay(1000);

		const buffers = [];
		for await (const chunk of req)
			buffers.push(chunk);

		let bodyQuery={};
		if (Buffer.concat(buffers).length)
			bodyQuery=JSON.parse(Buffer.concat(buffers));

		let l=new URL(req.url,"http://example.com");
		let query=Object.fromEntries(new URLSearchParams(l.search));
		Object.assign(query,bodyQuery);
		let params=l.pathname.split("/").filter(s=>s.length>0);
		let path="/"+params.join("/");

		/*if (params.length!=2) {
			res.writeHead(404);
			res.end("Malformed...");
			return;
		}*/

		let func=this.catnip.apis[path];
		if (func) {
			try {
				let data;
				await this.catnip.withSession(sessionId,async ()=>{
					data=await func(query);
				});
				res.writeHead(200);
				if (!data)
					data=null;
				res.end(JSON.stringify(data));
				return;
			}

			catch (e) {
				console.log(e);
				res.writeHead(500);
				res.end(JSON.stringify({
					message: e.message
				}));
				return;
			}
		}

		res.writeHead(404);
		res.end(JSON.stringify({
			message: "Not found......."
		}));
	}

	handleRequest=async (req, res)=>{
		let cookies=this.catnip.parseCookies(req);
		if (!cookies.catnip)
			cookies.catnip=uuidv4();

		try {
			if (req.url=="/catnip-bundle.js") {
				res.writeHead(200);
				res.end(this.clientBundle);
			}

			else if (req.url.startsWith("/api/")) {
				await this.handleApi(req,res,cookies.catnip);
			}

			else if (req.url.startsWith("/public/"))
				this.handlePublic(req,res);

			else {
				(async()=>{
					let clientSession={};
					await this.catnip.withSession(cookies.catnip,async ()=>{
						await this.catnip.doActionAsync("getClientSession",clientSession);
					});

					res.writeHead(200,{
						"Set-Cookie": `catnip=${cookies.catnip}`
					});

					let quotedSession=quoteAttr(JSON.stringify(clientSession));

					let clientPage=`<body><html>`;
					clientPage+=`<div id="catnip-root"></div>`;
					clientPage+=`<script data-session="${quotedSession}" src="/catnip-bundle.js"></script>`;
					clientPage+=`</html></body>`;

					res.end(clientPage);
				})();
			}
		}

		catch (e) {
			console.log(e);
			res.writeHead(500);
			res.end("");
		}
	}

	async run() {
		this.outDir=await this.createOutDir();
		console.log("Building in: "+this.outDir);

		if (!fs.existsSync("node_modules/react"))
			fs.symlinkSync("preact/compat","node_modules/react","dir");

		let stat=fs.lstatSync("node_modules/react");
		if (!stat.isSymbolicLink())
			throw new Error("react is not a link");

		try {
			await build({
				multiBundle: true,
				include: Object.values(this.getPluginPaths()),
				expose: {
					catnip: `${process.cwd()}/node_modules/catnip`
				},
				inject: [`${process.cwd()}/node_modules/catnip/src/utils/preact-shim.js`],
				external: ["mysql"],
				jsxFactory: "h",
				jsxFragment: "Fragment",
				//minify: true,
				outfile: this.outDir+"/catnip-bundle.js",
				loader: {".svg": "dataurl"}
			});
		}

		catch (e) {
			console.log("Build failed: "+e.message);
			process.exit();
		}

		await import(this.outDir+"/catnip-bundle.js");
		this.catnip=global.catnip;
		this.catnip.db.MySql=await import("mysql");

		console.log("Starting...");
		await this.catnip.serverMain(this.options);

		this.clientBundle=fs.readFileSync(this.outDir+"/catnip-bundle.js")+"window.catnip.clientMain();";

		let server=http.createServer(this.handleRequest);
		server.listen(3000,"localhost",()=>{
			console.log("Running...");
			console.log();
			console.log("    http://localhost:3000/");
			console.log();
		});
	}
}