import {katnip} from "katnip";

katnip.addAction("getPluginBundles",(bundles)=>{
	bundles.admin.push("katnip-media/components/MediaAdmin.jsx");
});