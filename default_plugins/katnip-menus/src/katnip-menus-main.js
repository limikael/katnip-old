import {katnip} from "katnip";

katnip.addApi("/api/getMenu",async ({setting}, sreq)=>{
	sreq.assertCap("manage-settings");
	return await katnip.getSetting(setting);
});

katnip.addApi("/api/saveMenu",async ({setting, value}, sreq)=>{
	sreq.assertCap("manage-settings");
	return await katnip.setSetting(setting,value);
});