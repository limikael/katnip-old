function parseSqlDef(s) {
	function tokenizeSqlDef(s) {
		function matchExprs(s, exprs) {
			for (let expr of exprs) {
				let match=s.match(expr);
				if (match && !match.index)
					return match;
			}
		}

		let exprs=[/^\w+/, /^,/, /^\(/, /^\)/, /^\s+/];
		let tokens=[];

		while (s.length) {
			let match=matchExprs(s,exprs);
			if (match[0].trim().length)
				tokens.push(match[0]);

			s=s.substr(match[0].length);
		}

		return tokens;
	}

	let tokens=tokenizeSqlDef(s);
	let res=[];
	let inner=res;
	let expectComma=false;

	for (let token of tokens) {
		switch (token) {
			case "(":
				if (inner!=res)
					throw new Error("Sql parse error, unexpected (");

				let a=[];
				res.push(a);
				inner=a;
				expectComma=false;
				break;

			case ")":
				if (inner==res)
					throw new Error("Sql parse error, unexpected )");

				inner=res;
				expectComma=false;
				break;

			case ",":
				if (!expectComma)
					throw new Error("Sql parse error, unexpected ,");

				expectComma=false;
				break;

			default:
				if (expectComma)
					throw new Error("Sql parse error, expected ,");

				inner.push(token);

				if (inner!=res)
					expectComma=true;
				break;
		}
	}

	if (inner!=res)
		throw new Error("Sql parse error");

	return res;
}

export default class FieldSpec {
	constructor() {

	}

	static fromSqlDef(def) {

		let tokens=parseSqlDef(def);
		console.log(tokens);
	}
}