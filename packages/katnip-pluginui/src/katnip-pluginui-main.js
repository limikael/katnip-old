import {katnip} from "katnip";
import "./katnip-pluginui-api.js";

katnip.addAction("getPluginBundles",(bundles)=>{
	bundles.admin.push("katnip-pluginui/components/PluginAdmin.jsx");
	bundles.admin.push("katnip-pluginui/components/ThemeAdmin.jsx");
});
