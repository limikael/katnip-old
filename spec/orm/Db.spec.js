import Db, {Model} from "../../src/orm/Db.js";
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
		await e.save();

		let f=await db.Employee.findOne({name: "Micke"});
		expect(f.meta.hello).toEqual("world");
	});
});
