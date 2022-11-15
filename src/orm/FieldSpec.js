function tokenizeSqlDef(s) {
	function matchExprs(s, exprs) {
		for (let expr of exprs) {
			let match=s.match(expr);
			if (match && !match.index)
				return match;
		}
	}

	let exprs=[/^(\w+)/, /^(,)/, /^(\()/, /^(\))/, /^'([^\']*)'/, /^\s+/];
	let tokens=[];

	while (s.length) {
		let match=matchExprs(s,exprs);
		if (match[1]!==undefined)
			tokens.push(match[1]);

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
	if (typeof s!="string")
		throw new Error("Not a string: "+JSON.stringify(s));

	return parseSqlDefTopLevel(tokenizeSqlDef(s));
}

export default class FieldSpec {
	static types={
		"integer": {sizeFree: true},
		"int": {aliasFor: "integer"},
		"char": {defaultSize: 1},
		"varchar": {},
		"text": {sizeFree: true},
		"json": {sizeFree: true, sqlType: "text"},
		"double": {sizeFree: true},
	};

	constructor(options) {
		for (let k in options)
			this[k]=options[k];

		this.primary_key=!!this.primary_key;
		this.auto_increment=!!this.auto_increment;

		if (!FieldSpec.types[this.type])
			throw new Error("Unknown sql type: "+this.type);

		if (FieldSpec.types[this.type].aliasFor)
			this.type=FieldSpec.types[this.type].aliasFor;

		if (!this.size)
			this.size=FieldSpec.types[this.type].defaultSize;

		if (!this.size && !FieldSpec.types[this.type].sizeFree)
			throw new Error("Need size for type: "+this.type);

		if (FieldSpec.types[this.type].sizeFree)
			this.size=undefined;

		if (this.default===undefined)
			this.default=null;
	}

	equals(that) {
		if (!that)
			return false;

		/*console.log(this);
		console.log(that);*/

		return (
			(this.getSqlType()==that.getSqlType()) &&
			(this.size==that.size) &&
			(this.null==that.null) &&
			(this.auto_increment==that.auto_increment) &&
			(this.primary_key==that.primary_key) &&
			(this.default===that.default)
		);
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
				case "autoincrement":
					options.auto_increment=true;
					sqlDef.shift();
					break;

				case "primary":
					sqlDef.shift();
					if (sqlDef[0]!="key")
						throw new Error("Sql syntax error at "+sqlDef[0]);

					options.primary_key=true;
					sqlDef.shift();
					break;

				case "default":
					sqlDef.shift();
					options.default=sqlDef[0];
					sqlDef.shift();
					break;

				default:
					throw new Error("Sql syntax error at "+sqlDef[0]);
					break;
			}
		}

		return new FieldSpec(options);
	}

	static fromDescribeRow(row) {
		//console.log(row);

		let options={};

		let typeDef=parseSqlDef(row.Type);
		options.type=typeDef.shift();
		if (Array.isArray(typeDef[0])) {
			if (!isNaN(typeDef[0][0]))
				options.size=parseInt(typeDef[0][0]);

			if (!isNaN(typeDef[0][1]))
				options.decimals=parseInt(typeDef[0][1]);

			typeDef.shift();
		}

		options.null=false;
		if (row.Null=="YES")
			options.null=true;

		options.auto_increment=false;
		if (row.Extra.includes("auto_increment"))
			options.auto_increment=true;

		if (row.Key=="PRI")
			options.primary_key=true;

		options.default=row.Default;
		if (row.Default=="NULL")
			options.default=null;

		return new FieldSpec(options);
	}

	getSqlType() {
		let typeSpec=FieldSpec.types[this.type];
		if (typeSpec.sqlType)
			return typeSpec.sqlType;

		return this.type;
	}

	getSql(flavour) {
		if (!flavour)
			flavour="mysql";

		let s=this.getSqlType();

		if (!FieldSpec.types[this.type].sizeFree)
			s+=`(${this.size})`;

		s+=(this.null?" null":" not null");

		if (this.primary_key)
			s+=" primary key";

		if (this.auto_increment) {
			if (flavour=="sqlite3")
				s+=" autoincrement";

			else
				s+=" auto_increment";
		}

		if (this.default!=null) {
			s+=" default '"+this.default+"'";
		}

		return s;
	}

	hydrate(dbValue) {
		switch (this.type) {
			case "json":
				if (dbValue==="")
					return undefined;

				return JSON.parse(dbValue);
				break;

			default:
				return dbValue;
				break;
		}
	}

	serialize(value) {
		switch (this.type) {
			case "json":
				if (value===undefined)
					return "";

				return JSON.stringify(value);
				break;

			default:
				return value;
				break;
		}
	}
}