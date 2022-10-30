import EventDispatcher from "events";

class SqliteConnection extends EventDispatcher {
	constructor(url) {
		super();
		this.url=new URL(url);
		this.flavour="sqlite3";
	}

	async connect() {
		this.Sqlite3=await import("sqlite3");
		let Database=this.Sqlite3.default.verbose().Database;
		await new Promise((resolve, reject)=>{
			this.sqlite3=new Database(this.url.pathname,(err)=>{
				if (err)
					reject(err);

				else
					resolve();
			});
		});
	}

	async describe(tableName) {
		let srows=await this.readQuery("SELECT sql FROM sqlite_master WHERE tbl_name=?",[tableName]);
		if (!srows.length)
			return undefined;

		let statement=srows[0].sql;
		let isAutoIncrement=statement.toLowerCase().includes("autoincrement");

		let rows=await this.readQuery("pragma table_info ("+tableName+")");
		let res=[];

		for (let row of rows) {
			let describeRow={
				Field: row.name,
				Type: row.type,
				Null: row.notnull?"NO":"YES",
				Extra: "",
				Key: row.pk?"PRI":""
			};

			if (isAutoIncrement && row.pk)
				describeRow.Extra="auto_increment";

			res.push(describeRow);
		}

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

	query(qs, params=[]) {
		let first=qs.split(/\s/)[0].toLowerCase();

		switch (first) {
			case "select":
				return this.readQuery(qs,params);
				break;

			case "insert":
			case "update":
			case "drop":
			case "create":
			case "delete":
			case "alter":
				return this.writeQuery(qs,params);
				break;

			default:
				throw new Error("unknown query type: "+first);
		}
	}

	close() {
		return new Promise((resolve, reject)=>{
			this.sqlite3.close((err)=>{
				if (err)
					reject(err);

				else
					resolve();
			});
		});
	}
}

class MySqlConnection extends EventDispatcher {
	constructor(url) {
		super();
		this.url=new URL(url);
		this.flavour="mysql";
	}

	async connect() {
		this.MySql=await import("mysql");

		this.mysql=this.MySql.createConnection({
			host: this.url.host,
			user: this.url.username,
			password: this.url.password,
			database: this.url.pathname.replace("/","")
		});

		this.mysql.on("error",(e)=>{
			console.log("got error...")
			this.emit("error",e);
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
		let show=await this.query("SHOW TABLES LIKE ?",[tableName]);
		if (!show.length)
			return undefined;

		return await this.query("DESCRIBE ??",[tableName]);
	}

	query(qs, params=[]) {
		return new Promise((resolve, reject)=>{
			this.mysql.query(qs,params,(error, results, fields)=>{
				if (error) {
					reject(error);
					return;
				}

				if (results.constructor.name=="OkPacket") {
					resolve({
						affectedRows: results.affectedRows,
						insertId: results.insertId
					});
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
	}

	close() {
		return new Promise((resolve, reject)=>{
			this.mysql.end((err)=>{
				if (err)
					reject(err);

				else
					resolve();
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

export function getDependencyPackage(url) {
	let urlObject=new URL(dsn);

	switch (urlObject.protocol) {
		case "mysql:":
			return "mysql";
			break;

		case "sqlite3:":
			return "sqlite3";
			break;

		default:
			throw new Error("Unknown database protocol: "+urlObject.protocol);
			break;
	}
}