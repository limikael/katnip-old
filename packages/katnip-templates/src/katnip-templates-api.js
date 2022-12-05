import {katnip} from "katnip";

function removeParentTermId(datas) {
	for (let data of datas) {
		delete data.parentTermId;
		removeParentTermId(data.children);
	}
}

function treeFromFlat(datas) {
	for (let data of datas)
		data.children=datas.filter((item)=>item.parentTermId==data.id);

	datas=datas.filter((item)=>!item.parentTermId);
	removeParentTermId(datas);

	return datas;
}

katnip.addApi("/api/getTermsTree",async ({taxonomy}, req)=>{
	req.assertCap("manage-settings");

	return treeFromFlat(await katnip.db.Term.findMany({taxonomy: taxonomy}));
});

async function saveTermData(termData, parentTermId, taxonomy) {
	let term=new katnip.db.Term(termData);
	term.taxonomy=taxonomy;
	term.parentTermId=parentTermId;
	await term.save();

	let usedIds=[term.id];
	if (termData.children)
		for (let childTermData of termData.children)
			usedIds=[...usedIds,...await saveTermData(childTermData,term.id,taxonomy)];

	return usedIds;
}

katnip.addApi("/api/saveTermsTree",async ({taxonomy, terms}, req)=>{
	req.assertCap("manage-settings");

	let usedIds=[];
	for (let termData of terms)
		usedIds=[...usedIds,...await saveTermData(termData, null, taxonomy)];

	for (let term of await katnip.db.Term.findMany({taxonomy: taxonomy}))
		if (!usedIds.includes(term.id))
			await term.delete();

	return treeFromFlat(await katnip.db.Term.findMany({taxonomy: taxonomy}));
});

katnip.addApi("/api/getDefaultTemplateContent",async ({}, req)=>{
	req.assertCap("manage-settings");

	let content=katnip.doAction("getDefaultTemplateContent");
	if (!content)
		content=[];

	return content;
});

katnip.addApi("/api/getTaxonomyOptions",async ({taxonomy}, req)=>{
	req.assertCap("manage-settings");

	let terms=await katnip.db.Term.findMany({taxonomy: taxonomy});
	let termOptions={};
	for (let term of terms)
		termOptions[String(term.id)]=term.title;

	return termOptions;
});

katnip.addApi("/api/listTerms",async ({},req)=>{
	req.assertCap("manage-settings");

	return await katnip.db.Term.findMany();
});