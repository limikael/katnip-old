class SqliteConnection {
	constructor(url) {
		this.url=new URL(url);
	}

	async connect() {
		this.Sqlite3=await import("sqlite3");
		let Database=this.Sqlite3.default.verbose().Database;
		this.sqlite3=new Database(this.url.pathname);
	}

	async describe(tableName) {
		let rows=await this.readQuery("pragma table_info ("+tableName+")");
		let res=[];

		for (let row of rows)
			res.push({
				Field: row.name,
				Type: row.type,
				Null: row.notnull?"NO":"YES",
				Extra: ""
			});

		return res;
	}

	readQuery(qs, params=[]) {
		return new Promise((resolve, reject)=>{
			this.sqlite3.all(qs,params,function(err, rows) {
				if (err)
					reject(err);

				resolve(rows);
			});
		});
	}

	writeQuery(qs, params=[]) {
		return new Promise((resolve, reject)=>{
			this.sqlite3.run(qs,params,function(err) {
				if (err)
					reject(err);

				resolve({
					affectedRows: this.changes,
					insertId: this.lastID
				});
			});
		});
	}
}

class MySqlConnection {
	constructor(url) {
		this.url=new URL(url);
	}

	async connect() {
		this.MySql=await import("mysql");

		this.mysql=this.MySql.createConnection({
			host: this.url.host,
			user: this.url.username,
			password: this.url.password,
			database: this.url.pathname.replace("/","")
		});

		return new Promise((resolve, reject)=>{
			this.mysql.connect((err)=>{
				if (err) {
					reject(err);
					return;
				}

				resolve();
			});
		})
	}

	async describe(tableName) {
		return await this.readQuery("DESCRIBE ??",[tableName]);
	}

	readQuery(qs, params=[]) {
		return new Promise((resolve, reject)=>{
			this.mysql.query(qs,params,(error, results, fields)=>{
				if (error) {
					reject(error);
					return;
				}

				if (results.constructor.name!="Array")
					throw new Error("This is not a read query");

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
	}

	writeQuery(qs, params=[]) {
		return new Promise((resolve, reject)=>{
			this.mysql.query(qs,params,(error, results, fields)=>{
				if (error) {
					reject(error);
					return;
				}

				if (results.constructor.name!="OkPacket")
					throw new Error("This is not a write query");

				resolve({
					affectedRows: results.affectedRows,
					insertId: results.insertId
				});
			});
		});
	}
}

export function createConnection(url) {
	let urlObject=new URL(url);

	switch (urlObject.protocol) {
		case "mysql:":
			return new MySqlConnection(url);
			break;

		case "sqlite3:":
			return new SqliteConnection(url);
			break;

		default:
			throw new Error("Unknown database protocol: "+urlObject.protocol);
			break;
	}
}
