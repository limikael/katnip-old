import FieldSpec from "../../src/orm/FieldSpec.js";

describe("FieldSpec",()=>{
	it("can create a field spec",()=>{
		let fieldSpec1=FieldSpec.fromSqlDef("text not null");
		//console.log(fieldSpec1.getSql());

		let fieldSpec2=FieldSpec.fromSqlDef("integer not null");
		//console.log(fieldSpec2.getSql());

		let fieldSpec3=FieldSpec.fromSqlDef("varchar(64) null");
		//console.log(fieldSpec3.getSql());

		let fieldSpec4=FieldSpec.fromSqlDef("integer not null autoincrement primary key");
		//console.log(fieldSpec4.getSql("sqlite3"));

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

	it("works with alias",()=>{
		let s=FieldSpec.fromSqlDef("integer not null autoincrement primary key");
		let t=FieldSpec.fromDescribeRow({
			Field: 'id',
			Type: 'int(11)',
			Null: 'NO',
			Key: 'PRI',
			Default: null,
			Extra: 'auto_increment'
		});

		expect(s.equals(t)).toEqual(true);
		expect(t.equals(s)).toEqual(true);
	});
});
