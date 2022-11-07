import {createWhereClause} from "../../src/orm/db-util.js";

describe("db-util",()=>{
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
