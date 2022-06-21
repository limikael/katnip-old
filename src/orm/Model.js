import {createWhereClause} from "./db-util.js";
import FieldSpec from "./FieldSpec.js";

export default class Model {
	constructor(data={}) {
		for (let k in data)
			this[k]=data[k];
	}

	async refresh() {
		let cls=this.constructor;

		if (!this.getPrimaryKeyValue())
			throw new Error("Can't refresh, no PK value.");

		let o={};
		o[cls.getPrimaryKeyField()]=this.getPrimaryKeyValue();
		let q=createWhereClause(o);

		let qs=`SELECT * FROM ${cls.getTableName()} ${q.query}`;
		let dbRows=await cls.db.query(qs,q.vals);
		let dbRow=dbRows[0];

		for (let fieldName in cls.fields) {
			let fieldSpec=cls.getFieldSpec(fieldName);
			this[fieldName]=fieldSpec.hydrate(dbRow[fieldName]);
		}
	}

	static async findMany(params={}) {
		let cls=this;
		let q;

		if (typeof params=="object" && params)
			q=createWhereClause(params);

		else {
			let o={};
			o[cls.getPrimaryKeyField()]=params;
			q=createWhereClause(o);
		}

		let qs=`SELECT * FROM ${cls.getTableName()} ${q.query}`;
		let dbRows=await cls.db.query(qs,q.vals);

		let res=[];
		for (let dbRow of dbRows) {
			let o={};
			for (let fieldName in cls.fields) {
				let fieldSpec=cls.getFieldSpec(fieldName);
				o[fieldName]=fieldSpec.hydrate(dbRow[fieldName]);
			}
			res.push(new cls(o));
		}

		return res;
	}

	static async getAggregate(sql, whereParams={}) {
		let cls=this;
		let q=createWhereClause(whereParams);
//		let wherePart="";
/*		if (q.query)
			wherePart=" WHERE "+q.query;*/

		let qs=`SELECT ${sql} FROM ${cls.getTableName()} ${q.query}`;
		let dbRows=await cls.db.query(qs,q.vals);

		let firstKey=Object.keys(dbRows[0])[0];
		return dbRows[0][firstKey];
	}

	static async getCount(params={}) {
		return this.getAggregate("COUNT(*)",params);
	}

	static async findOne(params) {
		let res=await this.findMany(params);

		return res[0];
	}

    getUpsertSql() {
		let cls=this.constructor;
		let res={qs: "", vals: []};
		for (let fieldName in cls.fields) {
			if (fieldName!=cls.getPrimaryKeyField()) {
				if (res.qs)
					res.qs+=`,`;

				let fieldSpec=cls.fields[fieldName];
				res.qs+=`\`${fieldName}\`=?`;
				let spec=cls.getFieldSpec(fieldName);
				res.vals.push(spec.serialize(this[fieldName]));
			}
		}
		return res;
	}

	async insert() {
		let cls=this.constructor;
		let upsert=this.getUpsertSql();
		let qs=`INSERT INTO ${cls.getTableName()} SET ${upsert.qs}`;
		await cls.db.query(qs,upsert.vals);
		this[cls.getPrimaryKeyField()]=cls.db.lastInsertId();
	}

	async update() {
		let cls=this.constructor;
		let upsert=this.getUpsertSql();
		let qs=`UPDATE ${cls.getTableName()} SET ${upsert.qs} WHERE ${cls.getPrimaryKeyField()}=?`;
		upsert.vals.push(this.getPrimaryKeyValue());
		await cls.db.query(qs,upsert.vals);
	}

	async save() {
		if (this.getPrimaryKeyValue())
			await this.update();

		else
			await this.insert();
	}

	async delete() {
		let id=this.getPrimaryKeyValue();
		if (!id)
			throw new Error("No PK value.");

		let cls=this.constructor;
		await cls.db.query(`DELETE FROM ${cls.getTableName()} WHERE ${cls.getPrimaryKeyField()}=?`,[id]);
	}

	getPrimaryKeyValue() {
		return this[this.constructor.getPrimaryKeyField()];
	}

	static getTableName() {
		if (this.tableName)
			return this.tableName;

		throw new Error("No tableName defined for: "+this.name);
		return this.name;
	}

	static getPrimaryKeyField() {
		return Object.keys(this.fields)[0];
	}

	static getFieldSpec(fieldId) {
		if (!this.fieldSpecs)
			this.fieldSpecs={};

		if (!this.fieldSpecs[fieldId])
			this.fieldSpecs[fieldId]=FieldSpec.fromSqlDef(this.fields[fieldId]);

		return this.fieldSpecs[fieldId];
	}

	static async install() {
		let cls=this;
		let qs=`CREATE TABLE IF NOT EXISTS ${cls.getTableName()} (`;

		// Create if it doesn't exist.
		for (let fieldName in cls.fields) {
			let fieldSpec=cls.getFieldSpec(fieldName).getSql();
			qs+=`\`${fieldName}\` ${fieldSpec},`;
		}

		qs+=`PRIMARY KEY (${this.getPrimaryKeyField()}))`;
		await this.db.query(qs);

		// Check current state of database.
		let describeResult=await this.db.query("DESCRIBE ??",[cls.getTableName()]);
		//console.log(describeResult);

		let existing={};
		for (let describeRow of describeResult)
			existing[describeRow["Field"]]=FieldSpec.fromDescribeRow(describeRow);

		// Create or modify existing fields.
		for (let fieldName in cls.fields) {
	        let fieldSpec=cls.getFieldSpec(fieldName);

			if (!Object.keys(existing).includes(fieldName))
				await this.db.query(`
					ALTER TABLE ${cls.getTableName()}
					ADD \`${fieldName}\` ${fieldSpec.getSql()}
				`);

			else if (!fieldSpec.equals(existing[fieldName]))
				await this.db.query(`
					ALTER TABLE ${cls.getTableName()}
					MODIFY \`${fieldName}\` ${fieldSpec.getSql()}
				`);
		}

		// Drup unused fields.
		let currentFieldNames=Object.keys(cls.fields);
		for (let existingField of Object.keys(existing)) {
			if (!currentFieldNames.includes(existingField)) {
				await this.db.query(`
					ALTER TABLE ${cls.getTableName()}
					DROP ${existingField}
				`);
			}
		}
	}
}
