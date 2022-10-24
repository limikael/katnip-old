import {katnip, Model} from "katnip";

export class UserAuthMethod extends Model {
	static tableName="UserAuthMethod";

	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY",
		userId: "INTEGER NOT NULL",
		method: "VARCHAR(255) NOT NULL",
		token: "VARCHAR(225)",
		meta: "JSON"
	};
}

export default class User extends Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY",
		role: "VARCHAR(64) NOT NULL",
		username: "VARCHAR(64)",
		meta: "JSON"
	};

	constructor(values) {
		super(values);

		if (!this.role)
			this.role="user";
	}

	static async findOneByAuth(method, token) {
		let authMethod=await UserAuthMethod.findOne({
			method: method,
			token: token
		});

		if (!authMethod)
			return null;

		return await User.findOne({id: authMethod.userId});
	}

	async populateAuthMethods() {
		if (!this.id)
			throw new Error("No pk");

		this.authMethods={};
		let authMethods=await UserAuthMethod.findMany({userId: this.id});
		for (let authMethod of authMethods)
			this.authMethods[authMethod.method]=authMethod;
	}
}
