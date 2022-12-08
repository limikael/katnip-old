import {katnip} from "katnip";
import fs from "fs";
import {docWrapFragment, docGetText} from "../richedit/doc-util.js";

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

export function renderContentExcerpt(contentFragment, length) {
	let s=docGetText(docWrapFragment(contentFragment));

	if (s.length>length)
		s=s.slice(0,length)+"...";

	return s;
}

/**
 * Create API endpoint for creating, reading, updating and deleteing.
 *
 * The createCrudApi function creates api endpoints for manipulating data in the
 * database. The endpoint will be available on the following URLs. The <name> part
 * corresponds to the lowercased name of the database table.
 *
 * * /api/<name>/list - List items.
 * * /api/<name>/get - Get a single item.
 * * /api/<name>/save - Save item.
 * * /api/<name>/delete - Delete item.
 *
 * The options object controls various options related to how the endpoint is set
 * up. The following options are recognized:
 *
 * * **cap** - The capability required by the calling user. Default is `manage-settings`.
 * * **onsave** - A function to call prior to saving an item. The function will be called
 *                with the item that is about to be saved as a parameter.
 * * **postsave** - A function to be called after an item has been saved.
 * * **ondelete** - A function to call prior to deleting an item.
 * * **postdelete** - A function to be called after an item has been deleted.
 *
 * @function Server Functions.createCrudApi
 * @param model:Model The model to create a Crud Api for.
 * @param options:Object Options.
 */
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
			await options.onsave(item);

		await item.save();

		if (options.postsave)
			await options.postsave(item);

		return item;
	});

	katnip.addApi(`/api/${name}/delete`,async ({id}, sreq)=>{
		sreq.assertCap(options.cap);

		let item=await model.findOne({id: id});
		if (!item)
			throw new Error("Not found");

		if (options.ondelete)
			options.ondelete(item);

		await item.delete();

		if (options.postdelete)
			options.postdelete(item);
	});
}
