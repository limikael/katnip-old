export {default as Model} from "./Model.js";

import {createConnection} from "./db-connection.js";

export default class Db {
	constructor(url) {
		this.url=url;
		this.classes=[];
	}

	addModel(cls) {
		if (cls.db)
			throw new Error("Already added to db");

		cls.db=this;
		this.classes.push(cls);

		this[cls.getTableName()]=cls;
	}

	async connect(url) {
		if (url) {
			if (this.url)
				throw new Error("Already have url");

			this.url=url;
		}

		if (!this.connectPromise) {
			this.connection=createConnection(this.url);
			this.connectPromise=this.connection.connect();
		}

		await this.connectPromise;
	}

	async install() {
		await this.connect();

		for (let cls of this.classes)
			await cls.install();
	}

	async writeQuery(qs, params=[]) {
		await this.connect();
		return await this.connection.writeQuery(qs,params);
	}

	async readQuery(qs, params=[]) {
		await this.connect();
		return await this.connection.readQuery(qs,params);
	}

	async describe(tableName) {
		await this.connect();
		return await this.connection.describe(tableName);
	}
}
