import {katnip} from "katnip";

export function createCrudApi(model, options={}) {
	let name=model.getTableName().toLowerCase();

	if (!options.cap)
		options.cap="manage-settings";

	katnip.addApi(`/api/${name}/list`,async (req)=>{
		req.assertCap(options.cap);
		return model.findMany();
	});

	katnip.addApi(`/api/${name}/get`,async (req)=>{
		let {id}=req.query;

		req.assertCap(options.cap);
		let item=await model.findOne({id: id});

		if (!item)
			throw new Error("Not found");

		return item;
	});

	katnip.addApi(`/api/${name}/save`,async (req)=>{
		let query=req.query;

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

	katnip.addApi(`/api/${name}/delete`,async (req)=>{
		let {id}=req.query;
		req.assertCap(options.cap);

		let item=await model.findOne({id: id});
		if (!item)
			throw new Error("Not found");

		await item.delete();

		if (options.postdelete)
			options.postdelete(item);
	});
}

export function convertToSlug(text) {
	return text.toLowerCase()
		.replace(/[^\w ]+/g, '')
		.replace(/\d/g,'')
		.replace(/^ +/g,'')
		.replace(/ +$/g,'')
		.replace(/ +/g, '-');
}
