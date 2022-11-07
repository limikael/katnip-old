import Db, {Model} from "../../src/orm/Db.js";
import fs from "fs";

describe("db install",()=>{
	let dbUrls=[
//		"mysql://mysql:mysql@localhost/katniptest",
		"sqlite3:test.sqlite3"
	];

	dbUrls.forEach((dbUrl)=>{
		it("can install",async ()=>{
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

			if (fs.existsSync("test.sqlite3"))
				fs.unlinkSync("test.sqlite3");

			let db=new Db(dbUrl);
			db.addModel(Employee);
			await db.install();

			// install twice, just to see if it works.
			await db.install();

			await (new Employee({test: "hello"})).save();
			await (new Employee({test: "world", name: "bla", salary: 123})).save();

			class Employee2 extends Model {
				static tableName="Employee";

				static fields={
					id: "INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY",
					name2: "VARCHAR(63)",
					test: "VARCHAR(64)",
					salary: "INTEGER",
					meta: "json"
				};
			}
			db.addModel(Employee2);

			await Employee2.install();

			expect((await Employee2.findOne({test: "world"})).salary).toEqual(123);
		});
	});
});
