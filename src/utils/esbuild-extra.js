import esbuild from "esbuild";
import fs from "fs";

function generateImportFile(importFile, includePaths, exposePaths) {
	let s="";

	for (let i in includePaths) {
		let path=includePaths[i];
		s+=`import * as include_${i} from "${path}";\n`;
	}

	for (let x in exposePaths) {
		let path=exposePaths[x];
		s+=`import * as expose_${x} from "${path}";\n`;
		s+=`if (typeof window!=='undefined') window.${x}=expose_${x}.default;\n`;
		s+=`if (typeof global!=='undefined') global.${x}=expose_${x}.default;\n`;
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