export {default as Model} from "./Model.js";

import DbConnection from "./DbConnection.js";

export default class Db {
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
