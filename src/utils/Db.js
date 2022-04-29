function createWhereClause(spec) {
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
			qs+=` \`${k}\`=? `
			vals.push(spec[k]);
		}
	}

	return {
		query: qs,
		vals: vals
	}
}

export class Model {
	constructor(data={}) {
		for (let k in data)
			this[k]=data[k];
	}

	static async findMany(params={}) {
		let cls=this;
		let q=createWhereClause(params);
		let wherePart="";
		if (q.query)
			wherePart=" WHERE "+q.query;

		let qs=`SELECT * FROM ${cls.name} ${wherePart}`;
		let dbRows=await cls.db.query(qs,q.vals);

		let res=[];
		for (let dbRow of dbRows)
			res.push(new cls(dbRow));

		return res;
	}

	static async findOne(params) {
		let res=await this.findMany(params);

		return res[0];
	}

	async insert() {
		let cls=this.constructor;
		let qs=`INSERT INTO ${cls.name} (`;
		let vals=[];

		for (let fieldName in cls.fields) {
			if (fieldName!=Object.keys(cls.fields)[0]) {
				if (fieldName!=Object.keys(cls.fields)[1])
					qs+=`,`;

				let fieldSpec=cls.fields[fieldName];
				qs+=`\`${fieldName}\``;
				vals.push(this[fieldName]);
			}
		}

		qs+=`) VALUES (`+Array(vals.length).fill("?")+`)`;

		await cls.db.query(qs,vals);
		this[cls.getPrimaryKeyField()]=cls.db.lastInsertId();
	}

	async update() {
		let cls=this.constructor;
		let qs=`UPDATE ${cls.name} SET `;
		let vals=[];

		for (let fieldName in cls.fields) {
			if (fieldName!=Object.keys(cls.fields)[0]) {
				if (fieldName!=Object.keys(cls.fields)[1])
					qs+=`,`;

				let fieldSpec=cls.fields[fieldName];
				qs+=`\`${fieldName}\`=?`;
				vals.push(this[fieldName]);
			}
		}

		qs+=` WHERE ${cls.getPrimaryKeyField()}=?`
		vals.push(this.getPrimaryKeyValue());

		await cls.db.query(qs,vals);
	}

	async save() {
		if (this.getPrimaryKeyValue()) {
			await this.update();
		}

		else
			await this.insert();
	}

	async delete() {
		let id=this.getPrimaryKeyValue();
		if (!id)
			throw new Error("No PK value.");

		let cls=this.constructor;
		await cls.db.query(`DELETE FROM ${cls.name} WHERE ${cls.getPrimaryKeyField()}=?`,[id]);
	}

	getPrimaryKeyValue() {
		return this[this.constructor.getPrimaryKeyField()];
	}

	static getPrimaryKeyField() {
		return Object.keys(this.fields)[0];
	}

	static async install() {
		let cls=this;
		let qs=`CREATE TABLE IF NOT EXISTS ${cls.name} (`;

		// Create if it doesn't exist.
		for (let fieldName in cls.fields) {
			let fieldSpec=cls.fields[fieldName];
			qs+=`\`${fieldName}\` ${fieldSpec},`;
		}

		qs+=`PRIMARY KEY (${this.getPrimaryKeyField()}))`;

		await this.db.query(qs);

		// Check current state of database.
		let describeResult=await this.db.query("DESCRIBE ??",[cls.name]);
		//console.log(describeResult);

		let existing={};
		for (let describeRow of describeResult)
			existing[describeRow["Field"]]=describeRow["Type"];

		// Create or modify existing fields.
		for (let fieldName in cls.fields) {
			let fieldDeclaration=cls.fields[fieldName];
			let q;

			if (Object.keys(existing).includes(fieldName))
				q=`ALTER TABLE ${cls.name} MODIFY \`${fieldName}\` ${fieldDeclaration}`;

			else
				q=`ALTER TABLE ${cls.name} ADD \`${fieldName}\` ${fieldDeclaration}`;

			await this.db.query(q);
		}

		// Drup unused fields.
		let currentFieldNames=Object.keys(cls.fields);
		for (let existingField of Object.keys(existing)) {
			if (!currentFieldNames.includes(existingField)) {
				await this.db.query(`ALTER TABLE ${cls.name} DROP ${existingField}`);
			}
		}
	}
}

export class Db {
	constructor(url) {
		if (url)
			this.createConnection(url);

		this.classes=[];
	}

	addModel(cls) {
		if (cls.db)
			throw new Error("Already added to db");

		cls.db=this;
		this.classes.push(cls);

		this[cls.name]=cls;
	}

	createConnection(url) {
		this.connection=new DbConnection(url);
		if (this.MySql)
			this.connection.MySql=this.MySql;
	}

	async connect(url) {
		if (url) {
			if (this.connection)
				throw new Error("URL already spec");

			this.createConnection(url);
		}

		if (!this.connection)
			throw new Error("Missing connection parameters");

		await this.connection.connect();
	}

	async install() {
		await this.connection.connect();

		for (let cls of this.classes)
			await cls.install();
	}

	async query(qs, params=[]) {
		await this.connection.connect();

		return await this.connection.query(qs,params);
	}

	lastInsertId() {
		return this.connection.lastInsertId();
	}
}

export class DbConnection {
	constructor(url) {
		this.url=new URL(url);
	}

	connect() {
		if (!this.connectionPromise) {
			this.connectionPromise=(async()=>{
				switch (this.url.protocol) {
					case "mysql:":
						if (!this.MySql)
							this.MySql=await import("mysql");

						this.mysql=this.MySql.createConnection({
							host: this.url.host,
							user: this.url.username,
							password: this.url.password,
							database: this.url.pathname.replace("/","")
						});

						this.mysql.connect();
						break;

					default:
						throw new Error("Unknown protocol: "+this.url.protocol);
						break;
				}
			})();
		}

		return this.connectionPromise;
	}

	query(qs, params=[]) {
		switch (this.url.protocol) {
			case "mysql:":
				return new Promise((resolve, reject)=>{
					this.mysql.query(qs,params,(error, results, fields)=>{
						this.mysqlInsertId=null;

						if (error) {
							reject(error);
							return;
						}

						if (results.constructor.name=="OkPacket") {
							this.mysqlInsertId=results.insertId;
							resolve();
							return;
						}

						let rows=[];
						for (let result of results) {
							let row={};
							for (let field of fields)
								row[field.name]=result[field.name];

							rows.push(row);
						}

						resolve(rows);
					});
				});
				break;

			default:
				throw new Error("Unknown protocol: "+this.url.protocol);
		}
	}

	lastInsertId() {
		switch (this.url.protocol) {
			case "mysql:":
				return this.mysqlInsertId;

			default:
				throw new Error("Unknown protocol: "+this.url.protocol);
		}
	}
}

export default Db;