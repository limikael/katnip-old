export function getClosestNodeWithClasses(node, classes) {
	if (!node)
		return null;

	if (node.classList)
		for (let cls of classes)
			if (node.classList.contains(cls))
				return node;

	return getClosestNodeWithClasses(node.parentNode,classes);
}

export function getNodePath(parent, child) {
	let c=getClosestNodeWithClasses(child,["child-container","component"]);
	if (c && c.classList.contains("component"))
		child=c;

	if (child.classList.contains("child-container"))
		while (!child.classList.contains("component"))
			child=child.parentNode;

	if (parent==child)
		return [];

	let index=Array.from(child.parentNode.childNodes).indexOf(child);

	return [...getNodePath(parent,child.parentNode),index];
}

export function getChildNodeByPath(el, path) {
	if (!path.length)
		return el;

	if (el.classList.contains("component"))
		el=el.querySelector(".child-container");

	return getChildNodeByPath(el.childNodes[path[0]],path.slice(1));
}

export function getBoundingRectSafe(el) {
	if (el.nodeName=="#text") {
		let range=document.createRange();
		range.selectNode(el);
		return range.getBoundingClientRect();
	}

	return el.getBoundingClientRect();
}

export function rectContains(rect, x, y) {
	return (x>=rect.x && x<=rect.x+rect.width && y>rect.y && y<rect.y+rect.height)
}
