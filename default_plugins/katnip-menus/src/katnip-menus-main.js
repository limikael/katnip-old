import {katnip} from "katnip";

katnip.addApi("/api/getMenu",async (req)=>{
	let {setting}=req.query;

	req.assertCap("manage-settings");
	return await katnip.getSetting(setting);
});

katnip.addApi("/api/saveMenu",async (req)=>{
	let {setting, value}=req.query;

	req.assertCap("manage-settings");
	return await katnip.setSetting(setting,value);
});