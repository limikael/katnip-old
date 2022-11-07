import {build} from "../../src/utils/esbuild-extra.js";

describe("esbuild-extra",()=>{
	it("can build",async ()=>{
		await build({
			namedMultiBundles: {
				main: [
					`${process.cwd()}/spec/utils/buildtest/mainmod.js`,
				],
				sub: [
					`${process.cwd()}/spec/utils/buildtest/moda.js`,
					`${process.cwd()}/spec/utils/buildtest/modb.js`,
				]
			},
			outdir: `${process.cwd()}/spec/utils/buildout/`,
			format: "esm",
			splitting: true
		});
	});
});