import Db, {Model} from "../src/Db.js";
import {createWhereClause} from "../src/db-util.js";
import FieldSpec from "../src/FieldSpec.js";
import mysql from "mysql";

class Employee extends Model {
	static tableName="Employee";

	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY",
		name: "VARCHAR(64)",
		test: "VARCHAR(64)",
		salary: "INTEGER",
		meta: "json"
	};
}

class TestSetting extends Model {
	static tableName="TestSetting";

	static fields={
		setting: "VARCHAR(255) NOT NULL primary key",
		value: "VARCHAR(255)"
	};
}

describe("db",()=>{
	let db;

	/*it("basic",async ()=>{
		db=new Db("sqlite3:test.sqlite3");

//		console.log(await db.query("select * from test",[]));
		console.log(await db.readQuery("select * from test where id=?",[2]));
//		console.log(await db.query("pragma table_info(test)"));

//		console.log(await db.writeQuery("insert into test (name) values (?)",["blabla"]));
	});*/

	beforeEach(async ()=>{
		if (!db) {
			//db=new Db("mysql://mysql:mysql@localhost/catniptest");
			db=new Db("sqlite3:test.sqlite3");

			db.addModel(Employee);
			db.addModel(TestSetting);

			await db.install();
		}

		for (let e of await Employee.findMany())
			await e.delete();

		for (let e of await TestSetting.findMany())
			await e.delete();
	})

	it("works",async ()=>{
		let e=new db.Employee({name: "Micke"});
		e.meta={hello: "world"};
		e.salary=5;
		await e.save();

		let g=await db.Employee.findOne({name: "Micke"});
		expect(g.salary).toEqual(5);

		e.salary=6;
		await e.save();

		let f=await db.Employee.findOne({name: "Micke"});
		expect(f.meta.hello).toEqual("world");
		expect(f.salary).toEqual(6);

		expect(await db.Employee.getCount()).toEqual(1);

		//console.log(JSON.stringify(e));
	});

	it("doesn't need AUTO_INCREMENT",async ()=>{
		let s=new TestSetting({setting: "test", value: 123});
		await s.save();

		expect(await TestSetting.getCount()).toEqual(1);
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
});
