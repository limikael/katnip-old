import http from "http";
import {build} from "../utils/esbuild-extra.js";
import fs from "fs";
import CatnipRequestHandler from "./CatnipRequestHandler.js";
import CatnipChannelHandler from "./CatnipChannelHandler.js";
import {createOutDir, getPluginPaths} from "./catnip-server-util.js";
import crypto from "crypto";

export default class CatnipServer {
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

	async build() {
		if (!this.options.minify)
			this.options.minify=false;

		this.outDir=await createOutDir();
		console.log("Building in: "+this.outDir+" minify: "+this.options.minify);

		if (!fs.existsSync("node_modules/react"))
			fs.symlinkSync("preact/compat","node_modules/react","dir");

		let stat=fs.lstatSync("node_modules/react");
		if (!stat.isSymbolicLink())
			throw new Error("react is not a link");

		try {
			await build({
				multiBundle: true,
				include: getPluginPaths(),
				expose: {
					catnip: `${process.cwd()}/node_modules/catnip`
				},
				inject: [`${process.cwd()}/node_modules/catnip/src/utils/preact-shim.js`],
				jsxFactory: "h",
				jsxFragment: "Fragment",
				minify: this.options.minify,
				outfile: this.outDir+"/catnip-bundle.js",
				loader: {".svg": "dataurl"}
			});
		}

		catch (e) {
			console.log("Build failed: "+e.message);
			process.exit();
		}

		console.log("Build done...");

		this.catnip=await import("catnip");
		for (let pluginPath of getPluginPaths()) {
			//console.log(pluginPath);
			await import(this.resolveMainFile(pluginPath));
		}

		this.catnip.addChannel("contentHash",()=>{
			return this.contentHash;
		});

		this.catnip.addAction("initChannels",(channelIds, sessionRequest)=>{
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
		await this.catnip.serverMain(this.options);

		this.requestHandler=new CatnipRequestHandler(this.catnip,this.options);

		let clientBundle=fs.readFileSync(this.outDir+"/catnip-bundle.js")+"window.catnip.clientMain();";
		this.requestHandler.setClientBundle(clientBundle);
		this.requestHandler.setContentHash(this.contentHash);

		let server=http.createServer(this.requestHandler.handleRequest);
		let channelHandler=new CatnipChannelHandler(this.catnip,server);

		server.listen(port,"0.0.0.0",()=>{
			console.log("Running on port "+port);
		});
	}
}