#!/usr/bin/env node

import esbuild from "esbuild";
import {render} from 'preact-render-to-string';
import {createElement} from "preact";

let options={
	entryPoints: ["spec/lab/ssr/client.jsx"],
	bundle: true,
	format: "esm",
//	splitting: true,
	outfile: "spec/lab/ssr/client.bundle.js",
//	outdir: "spec/lab/ssr/outdir",
	jsxFactory: "h",
	jsxFragment: "Fragment",
	inject: ["src/utils/preact-shim.js"],
//	minify: true
};

await esbuild.build(options);

let mod=await import("./client.bundle.js");

mod.run();

//let html=render(createElement(mod.Hello),{});
//let html=render(createElement("div",{class: "test"}));
//console.log(html);

//console.log(global.theGlobalName);