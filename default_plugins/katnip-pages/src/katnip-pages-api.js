import {catnip} from "catnip";

catnip.addApi("/api/getPageView",async ({query})=>{
	let page=await catnip.db.Page.findOne({
		$op: "or",
		slug: query,
		id: query
	});

	if (!page)
		throw new Error("NOT FOUND")

	return page;
})

catnip.addChannel("numPages",async ()=>{
	return await catnip.db.Page.getCount();
});

catnip.addChannel("pageContent",async ({id})=>{
	return await catnip.db.Page.findOne(id);
});
