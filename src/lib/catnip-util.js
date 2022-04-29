import {catnip} from "catnip";

export function createCrudApi(model, options={}) {
	let name=model.name.toLowerCase();

	catnip.addApi(`/api/${name}/list`,async ()=>{
		return model.findMany();
	});

	catnip.addApi(`/api/${name}/get`,async ({id})=>{
		let item=await model.findOne({id: id});

		if (!item)
			throw new Error("Not found");

		return item;
	});

	catnip.addApi(`/api/${name}/save`,async (query)=>{
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

		return item;
	});

	catnip.addApi(`/api/${name}/delete`,async ({id})=>{
		let item=await model.findOne({id: id});
		if (!item)
			throw new Error("Not found");

		await item.delete();
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
