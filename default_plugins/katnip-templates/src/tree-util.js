function removeParentTermId(datas) {
	for (let data of datas) {
		delete data.parentTermId;
		removeParentTermId(data.children);
	}
}

export function treeFromFlat(datas) {
	for (let data of datas)
		data.children=datas.filter((item)=>item.parentTermId==data.id);

	datas=datas.filter((item)=>!item.parentTermId);
	removeParentTermId(datas);

	return datas;
}

export function treeToFlat(datas, parentTermId) {
	if (!datas || !datas.length)
		return [];

	let result=[];
	for (let data of datas) {
		let flatChildren=treeToFlat(data.children,data.id);
		delete data.children;
		data.parentTermId=parentTermId;
		result=[...result,data,...flatChildren];
	}

	return result;
}

/*let flatData=[
	{id: 1, title: "one"},
	{id: 2, title: "two"},
	{id: 3, title: "three", parentTermId: 1},
	{id: 4, title: "four", parentTermId: 3},
];

let treeData=treeFromFlat(flatData);
//console.log(JSON.stringify(treeData,null,2));

let newFlatData=treeToFlat(treeData);
console.log(JSON.stringify(newFlatData,null,2));*/