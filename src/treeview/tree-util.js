export function indent(datas, current=0) {
	let res=[];

	for (let data of datas) {
		let children=data.children;

		if (typeof data!="string") {
			data={...data};
			data.children=[];
		}

		res.push({level: current, data: data});
		if (children)
			res=[...res,...indent(children,current+1)];
	}

	return res;
}

export function unindent(rows) {
	let root={data: {children: []}};
	let levelparents=[root];

	for (let row of rows) {
		row.data.children=[];
		let lev=row.level;
		while (!levelparents[lev])
			lev--;

		levelparents[lev].data.children.push(row.data);

		if (typeof row.data=="string") {
			levelparents.length=lev+1;
		}

		else {
			levelparents[lev+1]=row;
			levelparents.length=lev+2;
		}
	}

	return root.data.children;
}

export function numItemsIncludingChildren(data) {
	let num=1;

	if (data.children)
		for (let child of data.children)
			num+=numItemsIncludingChildren(child);

	return num;
}

export function itemDepth(data) {
	let childDepth=0;
	if (data.children)
		for (let child of data.children)
			childDepth=Math.max(childDepth,itemDepth(child));

	return (childDepth+1);
}

export function localCoords(el, c) {
	let rect=el.getBoundingClientRect();

	return {
		x: c.x-rect.x,
		y: c.y-rect.y
	}
}
