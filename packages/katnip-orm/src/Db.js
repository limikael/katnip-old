export {default as Model} from "./Model.js";
import {createConnection} from "./db-connection.js";
import {retry} from "./js-util.js";

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
			this.connection.on("error",this.onError);

			let retryOptions={
				times: 10,
				delay: 5000,
				onerror: (e)=>{
					if (e.code=="ECONNREFUSED") {
						console.log("Connection failed, trying again: "+e.message)
					}

					else 
						throw e;
				}
			};

			this.connectPromise=retry(async ()=>{
				await this.connection.connect();
			},retryOptions);
		}

		await this.connectPromise;
	}

	onError=(e)=>{
		if (e.code=="PROTOCOL_CONNECTION_LOST") {
			console.log("db connection lost...");
			this.connection=null;
			this.connectPromise=null;
		}

		else {
			console.log("unexpected db error...");
			throw e;
		}
	}

	async install() {
		await this.connect();

		for (let cls of this.classes)
			await cls.install();
	}

	async query(qs, params=[]) {
		await this.connect();

		try {
			return await this.connection.query(qs,params);
		}

		catch (e) {
			console.log(e);
			process.exit();
		}
	}

	async describe(tableName) {
		await this.connect();
		return await this.connection.describe(tableName);
	}

	getFlavour() {
		return this.connection.flavour;
	}
}
