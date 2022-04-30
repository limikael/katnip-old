import {build} from "../../src/utils/esbuild-extra.js";

/*describe("esbuild-extra",()=>{
	it("can build",async ()=>{
		await build({
			include: [
				`${process.cwd()}/spec/utils/buildtest/moda.js`,
				`${process.cwd()}/spec/utils/buildtest/modb.js`
			],
			expose: {
				"main": `${process.cwd()}/spec/utils/buildtest/mainmod.js`,
			},
			multiBundle: true,
			outfile: `${process.cwd()}/spec/utils/buildout/out.js`
		});
	});
});*/