import {createWhereClause} from "../../src/orm/db-util.js";

describe("db-util",()=>{
	it("can create a where clause",()=>{
		let w;

		w=createWhereClause({
			a: 5,
			b: 6,
			$limit: 1
		});
		expect(w.query).toEqual(' WHERE  `a`=? and `b`=?  LIMIT ? ');
		expect(w.vals).toEqual([ 5, 6, 1 ]);

		w=createWhereClause({
			a: 5,
			b: 6,
			$limit: [1,2]
		});
		expect(w.query).toEqual(' WHERE  `a`=? and `b`=?  LIMIT ?,? ');

		w=createWhereClause({
			a: 5,
			b: 6,
			$order: "bla"
		});
		expect(w.query).toEqual(' WHERE  `a`=? and `b`=?  ORDER BY bla');

		w=createWhereClause({
			"a>": 5,
			b: 6,
		});
		expect(w.query).toEqual(' WHERE  `a`>? and `b`=? ');
	});
});
