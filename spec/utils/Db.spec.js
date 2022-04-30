import Db, {Model} from "../../src/utils/Db.js";
import mysql from "mysql";

class Employee extends Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		name: "VARCHAR(64)",
		test: "VARCHAR(64)",
		salary: "INTEGER"
	};
}

/*describe("db",()=>{
	it("works",async ()=>{
		let db=new Db("mysql://mysql:mysql@localhost/catnip");

		//await db.connect();

		db.addModel(Employee);

		await db.install();

		let e=new db.Employee({name: "Micke"});
		await e.save();
		//console.log(await client.query("SELECT * FROM Employee"));

		e.salary=1234;
		e.name="Micke2";
		await e.save();

		await (new Employee({name: "Micke3",salary: 1234})).save();
		await (new Employee({name: "Micke4",salary: 12345})).save();

		//console.log(await client.query("SELECT * FROM Employee"));

//		console.log(await Employee.findOne({name:"Micke2",salary:1234}));
//		console.log(await Employee.findMany({salary:1234}));
	});
});*/
