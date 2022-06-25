import Db, {Model} from "../../src/orm/Db.js";
import {createWhereClause} from "../../src/orm/db-util.js";
import FieldSpec from "../../src/orm/FieldSpec.js";
import mysql from "mysql";

class Employee extends Model {
	static tableName="Employee";

	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		name: "VARCHAR(64)",
		test: "VARCHAR(64)",
		salary: "INTEGER",
		meta: "json"
	};
}

class TestSetting extends Model {
	static tableName="TestSetting";

	static fields={
		setting: "VARCHAR(255) NOT NULL",
		value: "VARCHAR(255)"
	};
}

describe("db",()=>{
	let db;

	beforeEach(async ()=>{
		if (!db) {
			db=new Db("mysql://mysql:mysql@localhost/catniptest");

			db.addModel(Employee);
			db.addModel(TestSetting);

			await db.install();
		}

		for (let e of await Employee.findMany())
			await e.delete();

		for (let e of await TestSetting.findMany())
			await e.delete();
	})

	it("doesn't need AUTO_INCREMENT",async ()=>{
		let s=new TestSetting({setting: "test", value: 123});
		await s.save();

		expect(await TestSetting.getCount()).toEqual(1);
	});

	it("works",async ()=>{
		let e=new db.Employee({name: "Micke"});
		e.meta={hello: "world"};
		e.salary=5;
		await e.save();

		e.salary=6;
		await e.save();

		let f=await db.Employee.findOne({name: "Micke"});
		expect(f.meta.hello).toEqual("world");
		expect(f.salary).toEqual(6);

		expect(await db.Employee.getCount()).toEqual(1);

		//console.log(JSON.stringify(e));
	});

	it("refreshes",async ()=>{
		let e=new db.Employee({name: "Micke",salary: 10});
		await e.save();

		let a=await db.Employee.findOne({name: "Micke"});
		let b=await db.Employee.findOne({name: "Micke"});

		a.salary=1234;
		await a.save();
		await b.refresh();

		expect(a.salary).toEqual(b.salary);
	});

	it("aggregate",async ()=>{
		let e;

		e=new db.Employee({name: "Micke",salary: 10});
		await e.save();

		e=new db.Employee({name: "Micke2",salary: 20});
		await e.save();

		let cnt=await db.Employee.getCount();
		expect(cnt).toEqual(2);

		let total=await db.Employee.getAggregate("SUM(salary)");
		expect(total).toEqual(30);

		let total2=await db.Employee.getAggregate("SUM(salary)",{name: "Micke"});
		expect(total2).toEqual(10);
	});

	it("can create a where clause",()=>{
		let w;

		w=createWhereClause({
			a: 5,
			b: 6,
			$limit: 1
		});
		//console.log(w);

		w=createWhereClause({
			a: 5,
			b: 6,
			$limit: [1,2]
		});
		//console.log(w);

		w=createWhereClause({
			a: 5,
			b: 6,
			$order: "bla"
		});
		//console.log(w);
	});

	it("can create a field spec",()=>{
		let fieldSpec1=FieldSpec.fromSqlDef("text not null");
		//console.log(fieldSpec1.getSql());

		let fieldSpec2=FieldSpec.fromSqlDef("integer not null");
		//console.log(fieldSpec2.getSql());

		let fieldSpec3=FieldSpec.fromSqlDef("varchar(64) null");
		//console.log(fieldSpec3.getSql());

		let rowSpec=FieldSpec.fromDescribeRow({
			Field: 'name',
			Type: 'varchar(64)',
			Null: 'YES',
			Key: '',
			Default: null,
			Extra: ''
		});

		//console.log(fieldSpec3);
		//console.log(rowSpec);

		expect(rowSpec.equals(fieldSpec3)).toEqual(true);
		expect(rowSpec.equals(fieldSpec2)).toEqual(false);
	});
});
