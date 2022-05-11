import Db, {Model} from "../../src/orm/Db.js";
import {createWhereClause} from "../../src/orm/db-util.js";
import mysql from "mysql";

class Employee extends Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		name: "VARCHAR(64)",
		test: "VARCHAR(64)",
		salary: "INTEGER",
		meta: {type: "json"}
	};
}

describe("db",()=>{
	it("works",async ()=>{
		let db=new Db("mysql://mysql:mysql@localhost/catniptest");

		db.addModel(Employee);
		await db.install();

		for (let e of await Employee.findMany())
			await e.delete();

		let e=new db.Employee({name: "Micke"});
		e.meta={hello: "world"};
		e.salary=5;
		await e.save();

		let f=await db.Employee.findOne({name: "Micke"});
		expect(f.meta.hello).toEqual("world");

		let g=new db.Employee({name: "Micke2"});
		g.meta={hello: "world"};
		g.salary=8;
		await g.save();

		let cnt=await db.Employee.getCount();
		expect(cnt).toEqual(2);

		let total=await db.Employee.getAggregate("SUM(salary)");
		expect(total).toEqual(13);

		let total2=await db.Employee.getAggregate("SUM(salary)",{name: "Micke"});
		expect(total2).toEqual(5);

		let a=await db.Employee.findOne({name: "Micke"});
		let b=await db.Employee.findOne({name: "Micke"});

		a.salary=1234;
		await a.save();
		await b.refresh();

		expect(a.salary).toEqual(b.salary);

		/*let stats=await db.Employee.getAggregate("SUM(salary), AVG(salary)");
		expect(total).toEqual([13,6.5]);*/
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
