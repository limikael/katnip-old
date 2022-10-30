import Model from "../../packages/katnip-orm/src/Model.js";

export default class UserAuthMethod extends Model {
	static tableName="UserAuthMethod";

	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY",
		userId: "INTEGER NOT NULL",
		method: "VARCHAR(255) NOT NULL",
		token: "VARCHAR(225)",
		meta: "JSON"
	};
}