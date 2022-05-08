function splitPath(p) {
	return p.split("/").filter(s=>s.length>0);
}

export function pathMatch(pattern, path) {
	pattern=splitPath(pattern);
	path=splitPath(path);

	let l=pattern.filter(x=>x=="**").length;
	if (l>1)
		throw new Error("Only one ** allowed");

	if (l==1 && pattern[pattern.length-1]!="**")
		throw new Error("** must be last");

	let specificity="";

	for (let i=0; i<pattern.length; i++) {
		if (pattern[i]=="**")
			specificity+="c";

		else if (pattern[i]=="*" && path[i])
			specificity+="b";

		else if (pattern[i]==path[i])
			specificity+="a";

		else
			return false;
	}

	return specificity;
}