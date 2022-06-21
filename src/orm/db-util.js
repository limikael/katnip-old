export function createWhereClause(spec, isSubClause) {
	if (!spec.$op)
		spec.$op="and";

	let qs="";
	let vals=[];
	let first=true;
	for (let k in spec) {
		if (k[0]!="$") {
			if (!first)
			  qs+=spec.$op;

			first=false;
			qs+=` \`${k}\`=? `;
			vals.push(spec[k]);
		}
	}

	if (vals.length && !isSubClause)
		qs=" WHERE "+qs;

	if (spec.$limit) {
		if (Array.isArray(spec.$limit)) {
			qs+=" LIMIT ?,? ";
			vals.push(...spec.$limit)
		}

		else {
			qs+=" LIMIT ? ";
			vals.push(spec.$limit)
		}
	}

	if (spec.$order) {
		qs+=" ORDER BY "+spec.$order;
	}

	return {
		query: qs,
		vals
	};
}

/*export function createSqlFieldSpec(declaration) {
	if (typeof declaration=="string")
		return declaration;

	switch (declaration.type) {
		case "json":
			return "TEXT NOT NULL";

		default:
			throw new Error("Unknown field declaration: "+JSON.stringify(declaration));
	}
}

export function serializeHydrated(v, declaration) {
	if (typeof declaration=="string")
		return v;

		switch (declaration.type) {
			case "json":
				return JSON.stringify(v);
				break;

		default:
			throw new Error("Unknown field declaration: "+JSON.stringify(declaration));
	}
}

export function hydrate(v, declaration) {
	if (typeof declaration=="string")
		return v;

	switch (declaration.type) {
		case "json":
			if (v=="")
				return void 0;
			return JSON.parse(v);
			break;

		default:
		  throw new Error("Unknown field declaration: " + JSON.stringify(declaration));
	}
}*/
