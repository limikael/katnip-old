import esbuild from "esbuild";
import fs from "fs";

function generateImportFile(importFile, includePaths) {
	let s="";

	for (let i in includePaths) {
		let path=includePaths[i];
		s+=`export * from "${path}";\n`;
	}

	fs.writeFileSync(importFile,s);
}

export async function build(options) {
	options={...options};

	if (options.multiBundle) {
		if (options.outdir)
			throw new Error("don't need outdir");

		if (!options.outfile)
			throw new Error("outfile missing");

		options.bundle=true;

		let importFileName=options.outfile+".import.js";
		generateImportFile(importFileName,options.include);
		options.entryPoints=[importFileName];

		delete options.multiBundle;
		delete options.outdir;
		delete options.include;
	}

	if (options.namedMultiBundles) {
		if (!options.outdir)
			throw new Error("outdir missing");

		fs.mkdirSync(options.outdir+"/import",{recursive: true});

		options.entryPoints=[];
		options.bundle=true;
		options.outExtension={
			".js":".mjs"
		};

		for (let name in options.namedMultiBundles) {
			let include=options.namedMultiBundles[name];

			let importFileName=options.outdir+"/import/"+name+".mjs";
			generateImportFile(importFileName,include);

			options.entryPoints.push(importFileName);
		}

		delete options.namedMultiBundles;
	}

	return await esbuild.build(options);
}