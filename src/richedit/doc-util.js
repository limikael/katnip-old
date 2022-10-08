export function docRemoveNode(doc, path) {
	if (!path || !path.length)
		throw new Error("Can't remove root!");

	if (path.length==1) {
		doc.children.splice(path[0],1);
		return doc;
	}

	else {
		let thisIndex=path[0];
		let restPath=path.slice(1);

		doc.children[thisIndex]=docRemoveNode(doc.children[thisIndex],restPath);
		return doc;
	}
}

export function docReplaceNode(doc, path, newNode) {
	if (!path.length)
		return newNode;

	else {
		let thisIndex=path[0];
		let restPath=path.slice(1);

		doc.children[thisIndex]=docReplaceNode(doc.children[thisIndex],restPath,newNode);
		return doc;
	}
}

export function docGetNode(doc, path) {
	if (!path || !path.length)
		return doc;

	return docGetNode(doc.children[path[0]],path.slice(1));
}

export function docGetChildPaths(doc, path) {
	if (!path.length) {
		if (typeof doc=="string")
			return [];

		let a=[];
		for (let i=0; i<doc.children.length; i++)
			a.push([i]);

		return a;
	}

	let a=docGetChildPaths(doc.children[path[0]],path.slice(1))
	for (let i=0; i<a.length; i++)
		a[i]=[path[0],...a[i]];

	return a;
}

export function docSetNodeProps(doc, path, props) {
	if (!path || !path.length) {
		doc.props=props;
		return doc;
	}

	let thisIndex=path[0];
	let restPath=path.slice(1);

	doc.children[thisIndex]=docSetNodeProps(doc.children[thisIndex],restPath,props);
	return doc;
}

export function docAddNode(doc, path, node) {
	if (!path || !path.length) {
		doc.children.push(node);
		return doc;
	}

	let thisIndex=path[0];
	let restPath=path.slice(1);
	doc.children[thisIndex]=docAddNode(doc.children[thisIndex],restPath,node);
	return doc;
}

export function docAddNodeSibling(doc, path, node) {
	if (!path || !path.length)
		throw new Error("Can't add sibling to root");

	if (path.length==1) {
		doc.children=[
			...doc.children.slice(0,path[0]+1),
			node,
			...doc.children.slice(path[0]+1)
		];
		return doc;
	}

	let thisIndex=path[0];
	let restPath=path.slice(1);

	doc.children[thisIndex]=docAddNodeSibling(doc.children[thisIndex],restPath,node);
	return doc;
}

export function docGetStructure(doc) {
	if (typeof doc=="string")
		return "";

	console.log(doc);

	return {
		type: doc.type,
		children: doc.children.map(c=>docGetStructure(c))
	}
}