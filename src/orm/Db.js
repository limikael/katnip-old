export {default as Model} from "./Model.js";
import {createConnection, getDependencyPackage} from "./db-connection.js";
import {retry} from "../utils/js-util.js";

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

	getDependencyPackage() {
		return getDependencyPackage(this.url);
	}

	async connect(url, options={}) {
		if (url) {
			if (this.url)
				throw new Error("Already have url");

			this.url=url;
		}

		if (!this.connectPromise) {
			this.connection=createConnection(this.url);
			this.connection.on("error",this.onError);

			let times=10;
			if (options.retryTimes)
				times=options.retryTimes;

			let retryOptions={
				times: times,
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

	async close() {
		if (this.connection) {
			await this.connection.close();
			this.connection=null;
			this.connectPromise=null;
		}
	}

	onError=(e)=>{
		if (e.code=="PROTOCOL_CONNECTION_LOST" ||
				e.code=="ECONNRESET") {
			console.log("db connection error: "+e.code);
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
		return await this.connection.query(qs,params);
	}

	async describe(tableName) {
		await this.connect();
		return await this.connection.describe(tableName);
	}

	getFlavour() {
		return this.connection.flavour;
	}
}
