import esbuild from "esbuild";
import fs from "fs";

function generateImportFile(importFile, includePaths, exposePaths) {
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
		generateImportFile(importFileName,options.include,options.expose);
		options.entryPoints=[importFileName];

		delete options.multiBundle;
		delete options.outdir;
		delete options.include;
		delete options.expose;
	}

	return await esbuild.build(options);
}