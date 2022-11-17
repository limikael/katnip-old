import {katnip} from "katnip";

katnip.addAction("getPluginBundles",(bundles)=>{
	bundles.admin.push("katnip-media/components/MediaAdmin.jsx");
});

katnip.addApi("/api/uploadMedia",async ({file},req)=>{
	console.log(file.filepath+" - "+file.originalFilename);
});