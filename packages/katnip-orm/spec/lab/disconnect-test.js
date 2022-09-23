import Db, {Model} from "../../src/Db.js";

function delay(millis) {
	return new Promise((resolve)=>{
		setTimeout(resolve,millis);
	});
}

class MyModel extends Model {
	static tableName="MyModel";
	static fields={
		id: "integer not null primary key auto_increment",
		a: "varchar(64) not null"
	}
}

async function main() {
	let db=new Db("mysql://mysql:mysql@localhost/katniptest");
	db.addModel(MyModel);
	await db.install();

	for (let m of await MyModel.findMany())
		await m.delete();

	for (let i=0; i<10; i++) {
		let m=new MyModel({a: "hello"+i});
		await m.save();
	}

	while (true) {
		console.log("finding...");
		let m=await MyModel.findOne({a: "hello1"});
		console.log("data: "+m.a);
		await delay(10000);
	}
}

main();