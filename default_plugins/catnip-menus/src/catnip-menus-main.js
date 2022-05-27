import {catnip} from "catnip";

catnip.addApi("/api/getMenu",async ({setting}, sreq)=>{
	sreq.assertCap("manage-settings");
	return await catnip.getSetting(setting);
});

catnip.addApi("/api/saveMenu",async ({setting, value}, sreq)=>{
	sreq.assertCap("manage-settings");
	return await catnip.setSetting(setting,value);
});