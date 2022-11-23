export function docWrapFragment(fragment) {
	return {
		type: "#root",
		children: fragment
	}
}

export function docGetText(doc) {
	if (typeof doc=="string")
		return doc;

	let a=[];
	for (let c of doc.children)
		a.push(docGetText(c));

	return a.join(" ");
}

export function validateXml(xml) {
	let parser=new DOMParser();
	let doc=parser.parseFromString("<top>"+xml+"</top>","text/xml");
	let errorNode=doc.querySelector('parsererror');
	if (errorNode)
		return errorNode.querySelector("div").textContent;

	return null;
}

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function escapeXmlAttr(unsafe) {
    return unsafe.replace(/[<>&'"\n\r\t]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            case "\n": return "&#xA;";
            case "\r": return "&#xD;";
            case "\t": return "&#x9;";
        }
    });
}

export function docToXml(doc, indent=0) {
	let rep=(s,n)=>Array(n).fill(s).join("");

	if (typeof doc=="string") {
		if (!doc.trim())
			return "";

		return rep("\t",indent)+escapeXml(doc)+"\n";
	}

	let attr="";
	for (let k in doc.props) {
		attr+=" "+k+'="'+escapeXmlAttr(doc.props[k])+'"';
	}

	let s="";
	if (doc.children.length)
		s+=rep("\t",indent)+"<"+doc.type+attr+">\n"+
			docFragmentToXml(doc.children,indent+1)+
			rep("\t",indent)+"</"+doc.type+">\n";

	else	
		s=rep("\t",indent)+"<"+doc.type+attr+"/>";

	return s;
}

export function docFragmentToXml(docFragment, indent=0) {
	let s="";
	for (let node of docFragment) {
		s+=docToXml(node,indent);
	}

	return s;
}

function docNodeFromXmlNode(xmlNode) {
	if (xmlNode.nodeType==Node.TEXT_NODE) {
		let s=xmlNode.textContent;
		s=s.replace(/^[\t\n]+/,"");
		s=s.replace(/[\t\n]+$/,"");
		if (!s.trim())
			return null;

		return s;
	}

	let o={
		type: xmlNode.nodeName,
		props: {},
		children: []
	};

	if (xmlNode.hasAttributes())
		for (let attr of xmlNode.attributes)
			o.props[attr.name]=attr.value;

	for (let childNode of xmlNode.childNodes) {
		let c=docNodeFromXmlNode(childNode);

		if (c)
			o.children.push(c);
	}

	return o;
}

export function docNodeFromXml(xml) {
	let parser=new DOMParser();
	let doc=parser.parseFromString(xml,"text/xml");
	let errorNode=doc.querySelector('parsererror');
	if (errorNode)
		throw new Error(errorNode.querySelector("div").textContent);

	return docNodeFromXmlNode(doc.childNodes[0]);
}

export function docFragmentFromXml(xml) {
	return docNodeFromXml("<top>"+xml+"</top>").children;
}

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

	return {
		type: doc.type,
		children: doc.children.map(c=>docGetStructure(c))
	}
}

export function docMap(doc, fn, path=[]) {
	fn(doc,path);

	if (doc.children)
		for (let i=0; i<doc.children.length; i++)
			docMap(doc.children[i],fn,[...path,i]);

	return doc;
}

export function docFindPath(doc, fn, path=[]) {
	if (fn(doc,path))
		return path;

	if (doc.children)
		for (let i=0; i<doc.children.length; i++) {
			let n=docFindPath(doc.children[i],fn,[...path,i]);
			if (n)
				return n;
		}
}