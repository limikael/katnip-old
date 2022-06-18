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

function parseSqlDefParanthesis(tokens) {
	let output=[], needComma=false;
	while (tokens.length) {
		switch (tokens[0]) {
			case ")":
				if (output.length && !needComma)
					throw new Error("Sql error: Unexpected ,");

				tokens.shift();
				return output;
				break;

			case ",":
				if (!needComma)
					throw new Error("Sql error: Unexpected ,");

				needComma=false;
				tokens.shift();
				break;

			case "(":
				throw new Error("Sql error: Unexpected (");
				break;

			default:
				if (needComma)
					throw new Error("Sql error: Expected ,");

				output.push(tokens[0]);
				needComma=true;
				tokens.shift();
				break;
		}
	}

	throw new Error("Sql error: Expected )");
}

function parseSqlDefTopLevel(tokens) {
	let output=[];
	while (tokens.length) {
		switch (tokens[0]) {
			case "(":
				tokens.shift();
				output.push(parseSqlDefParanthesis(tokens));
				break;

			default:
				output.push(tokens[0].toLowerCase());
				tokens.shift();
				break;
		}
	}

	return output;
}

function parseSqlDef(s) {
	return parseSqlDefTopLevel(tokenizeSqlDef(s));
}

export default class FieldSpec {
	constructor(options) {
		for (let k in options)
			this[k]=options[k];
	}

	static fromSqlDef(def) {
		let sqlDef=parseSqlDef(def);
		let options={};

		options.type=sqlDef.shift();
		if (Array.isArray(sqlDef[0])) {
			if (!isNaN(sqlDef[0][0]))
				options.size=parseInt(sqlDef[0][0]);

			if (!isNaN(sqlDef[0][1]))
				options.decimals=parseInt(sqlDef[0][1]);

			sqlDef.shift();
		}

		options.null=true;
		options.auto_increment=false;

		while (sqlDef.length) {
			switch (sqlDef[0]) {
				case "null":
					options.null=true;
					sqlDef.shift();
					break;

				case "not":
					sqlDef.shift();
					if (sqlDef[0]!="null")
						throw new Error("Sql syntax error at "+sqlDef[0]);
	
					sqlDef.shift();
					options.null=false;
					break;

				case "auto_increment":
					options.auto_increment=true;
					sqlDef.shift();
					break;

				default:
					throw new Error("Sql syntax error at "+sqlDef[0]);
					break;
			}
		}

		return new FieldSpec(options);
	}
}