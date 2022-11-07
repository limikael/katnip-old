import Db, {Model} from "../../src/orm/Db.js";
import {createWhereClause} from "../../src/orm/db-util.js";
import FieldSpec from "../../src/orm/FieldSpec.js";
import mysql from "mysql";

describe("db",()=>{
	async function createDb(url) {
		let	db=new Db(url);

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

		db.addModel(Employee);
		db.addModel(TestSetting);

		await db.install();

		for (let e of await Employee.findMany())
			await e.delete();

		for (let e of await TestSetting.findMany())
			await e.delete();

		return db;
	}

	let dbUrls=[
//		"mysql://mysql:mysql@localhost/katniptest",
		"sqlite3:test.sqlite3"
	];

	dbUrls.forEach((dbUrl)=>{
		it("works",async ()=>{
			let db=await createDb(dbUrl);

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
			let db=await createDb(dbUrl);

			let s=new db.TestSetting({setting: "test", value: 123});
			await s.save();

			expect(await db.TestSetting.getCount()).toEqual(1);
		});

		it("refreshes",async ()=>{
			let db=await createDb(dbUrl);

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
			let db=await createDb(dbUrl);
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
	});
});
