import {catnip} from "catnip";

catnip.addApi("/api/getSettingCategories",async ({},sreq)=>{
	sreq.assertCap("manage-settings");

	let categories=catnip.getSettingCategories();
	for (let categoryId in categories) {
		let category=categories[categoryId];
		category.settings=catnip.getSettings({category: categoryId})
	}

	return categories;
});

catnip.addApi("/api/getSettings",async ({category},sreq)=>{
	sreq.assertCap("manage-settings");
	let res={};

	for (let setting of catnip.getSettings({category: category}))
		res[setting.id]=setting.value;

	return res;
});

catnip.addApi("/api/saveSettings",async (settings, sreq)=>{
	sreq.assertCap("manage-settings");
	for (let k in settings)
		await catnip.setSetting(k,settings[k]);

	let affectedCategories=[];
	for (let setting of catnip.getSettings()) {
		if (Object.keys(settings).includes(setting.id)) {
			if (setting.category &&
					!affectedCategories.includes(setting.category))
				affectedCategories.push(setting.category);
		}
	}

	for (let k in catnip.getSettingCategories()) {
		let category=catnip.getSettingCategories()[k];
		if (affectedCategories.includes(category.id)) {
			if (category.postsave) {
				await category.postsave();
			}
		}
	}
});
