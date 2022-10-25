import {katnip} from "katnip";
import fs from "fs";

export function getKatnipDir(dir) {
	if (!dir)
		dir=process.cwd();

	if (fs.existsSync(dir+"/node_modules/katnip"))
		return dir;
}

export function convertToSlug(text) {
	return text.toLowerCase()
		.replace(/[^\w ]+/g, '')
		.replace(/\d/g,'')
		.replace(/^ +/g,'')
		.replace(/ +$/g,'')
		.replace(/ +/g, '-');
}

export function createCrudApi(model, options={}) {
	let name=model.getTableName().toLowerCase();

	if (!options.cap)
		options.cap="manage-settings";

	katnip.addApi(`/api/${name}/list`,async ({}, sreq)=>{
		sreq.assertCap(options.cap);
		return model.findMany();
	});

	katnip.addApi(`/api/${name}/get`,async ({id}, sreq)=>{
		sreq.assertCap(options.cap);
		let item=await model.findOne({id: id});

		if (!item)
			throw new Error("Not found");

		return item;
	});

	katnip.addApi(`/api/${name}/save`,async (query, sreq)=>{
		sreq.assertCap(options.cap);
		let item;

		if (query.id)
			item=await model.findOne({id: query.id});

		else
			item=new model();

		for (let k in query)
			if (k!="id")
				item[k]=query[k];

		if (options.onsave)
			options.onsave(item);

		await item.save();

		if (options.postsave)
			options.postsave(item);

		return item;
	});

	katnip.addApi(`/api/${name}/delete`,async ({id}, sreq)=>{
		sreq.assertCap(options.cap);

		let item=await model.findOne({id: id});
		if (!item)
			throw new Error("Not found");

		await item.delete();

		if (options.postdelete)
			options.postdelete(item);
	});
}
