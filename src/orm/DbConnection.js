function mysqlConnect(mysql) {
	return new Promise((resolve, reject)=>{
		mysql.connect((err)=>{
			if (err) {
				reject(err);
				return;
			}

			resolve(err);
		});
	});
}

export default class DbConnection {
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

						await mysqlConnect(this.mysql);
						break;

					default:
						throw new Error("Unknown protocol: "+this.url.protocol);
						break;
				}
			})();

			this.connectionPromise.catch((e)=>{
				this.connectionPromise=null;
			});
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
