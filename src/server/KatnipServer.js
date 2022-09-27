import http from "http";
import {build} from "../utils/esbuild-extra.js";
import fs from "fs";
import KatnipRequestHandler from "./KatnipRequestHandler.js";
import KatnipChannelHandler from "./KatnipChannelHandler.js";
import {createOutDir, getPluginPaths} from "./katnip-server-util.js";
import crypto from "crypto";

export default class KatnipServer {
	constructor(options={}) {
		this.options=options;
	}

	getFileHash(fn) {
		let content=fs.readFileSync(fn);
		let hash=crypto
			.createHash('sha1')
			.update(content, 'utf8')
			.digest('base64');

		return hash;
	}

	getContentFileHashes(dir) {
		let res=[];

		for (let dirContent of fs.readdirSync(dir)) {
			let cand=dir+"/"+dirContent;
			if (fs.lstatSync(cand).isDirectory())
				res.push(...this.getContentFileHashes(cand))

			else
				res.push(this.getFileHash(cand))
		}

		return res;
	}

	computeContentHash() {
		let allHashes=[];

		for (let pluginPath of getPluginPaths())
			if (fs.existsSync(pluginPath+"/public"))
				allHashes.push(...this.getContentFileHashes(pluginPath+"/public"));

		let hash=crypto
			.createHash('sha1')
			.update(allHashes.join(), 'utf8')
			.digest('hex');

		return hash;
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

	async build() {
		if (!this.options.minify)
			this.options.minify=false;

		this.outDir=await createOutDir();
		console.log("Building in: "+this.outDir+" minify: "+this.options.minify);

		this.linkAlias("react","preact/compat");
		this.linkAlias("react-dom","preact/compat");

		try {
			await build({
				multiBundle: true,
				include: getPluginPaths(),
				expose: {
					katnip: `${process.cwd()}/node_modules/katnip`
				},
				inject: [`${process.cwd()}/node_modules/katnip/src/utils/preact-shim.js`],
				jsxFactory: "h",
				jsxFragment: "Fragment",
				minify: this.options.minify,
				outfile: this.outDir+"/katnip-bundle.js",
				loader: {".svg": "dataurl"}
			});
		}

		catch (e) {
			console.log("Build failed: "+e.message);
			process.exit();
		}

		console.log("Build done...");

		this.katnip=await import("katnip");
		for (let pluginPath of getPluginPaths()) {
			//console.log(pluginPath);
			await import(this.resolveMainFile(pluginPath));
		}

		this.katnip.addChannel("contentHash",()=>{
			return this.contentHash;
		});

		this.katnip.addAction("initChannels",(channelIds, sessionRequest)=>{
			channelIds.push("contentHash");
		});
	}

	async run() {
		await this.build();

		let port=this.options.port;
		if (!port)
			port=3000;

		this.contentHash=this.computeContentHash();
		console.log("Content hash: "+this.contentHash);

		console.log("Starting...");
		await this.katnip.serverMain(this.options);

		this.requestHandler=new KatnipRequestHandler(this.katnip,this.options);

		let clientBundle=fs.readFileSync(this.outDir+"/katnip-bundle.js")+"window.katnip.clientMain();";
		this.requestHandler.setClientBundle(clientBundle);
		this.requestHandler.setContentHash(this.contentHash);

		let server=http.createServer(this.requestHandler.handleRequest);
		let channelHandler=new KatnipChannelHandler(this.katnip,server);

		server.listen(port,"0.0.0.0",()=>{
			console.log("Running on port "+port);
		});
	}
}