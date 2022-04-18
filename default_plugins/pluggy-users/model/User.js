import pluggy, {Model} from "pluggy";

export default class User extends Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		email: "VARCHAR(255) NOT NULL",
		password: "VARCHAR(255) NOT NULL",
		role: "VARCHAR(64) NOT NULL",
	};
}