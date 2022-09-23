import {katnip} from "katnip";

katnip.addApi("/api/getSettingCategories",async ({},sreq)=>{
	sreq.assertCap("manage-settings");

	let categories=katnip.getSettingCategories();
	for (let categoryId in categories) {
		let category=categories[categoryId];
		category.settings=katnip.getSettings({category: categoryId})

		for (let setting of category.settings) {
			if (setting.options instanceof Function)
				setting.options=await setting.options();
		}
	}

	return categories;
});

katnip.addApi("/api/getSettings",async ({category},sreq)=>{
	sreq.assertCap("manage-settings");
	let res={};

	for (let setting of katnip.getSettings({category: category}))
		res[setting.id]=setting.value;

	return res;
});

katnip.addApi("/api/saveSettings",async (settings, sreq)=>{
	sreq.assertCap("manage-settings");

	for (let k in settings)
		await katnip.setSetting(k,settings[k]);

	let affectedCategories=[];
	for (let setting of katnip.getSettings()) {
		if (Object.keys(settings).includes(setting.id)) {
			if (setting.category &&
					!affectedCategories.includes(setting.category))
				affectedCategories.push(setting.category);
		}
	}

	for (let k in katnip.getSettingCategories()) {
		let category=katnip.getSettingCategories()[k];
		if (affectedCategories.includes(category.id)) {
			if (category.postsave) {
				await category.postsave();
			}
		}
	}
});
