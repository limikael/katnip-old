import {catnip, Model} from "catnip";
//import crypto from "crypto";

function hash(v) {
	return crypto.createHash("sha256").update(v).digest().toString("hex");			
}

export class UserAuthMethod extends Model {
	static tableName="UserAuthMethod";

	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY",
		userId: "INTEGER NOT NULL",
		method: "VARCHAR(255) NOT NULL",
		token: "VARCHAR(225) NOT NULL",
		meta: "JSON"
	};

	setPassword(newPassword) {
		if (this.method!="email")
			throw new Error("Wrong method");

		if (!newPassword || newPassword.length<6)
			throw new Error("The password is too short");

		let salt=hash(crypto.randomBytes(64));
		let password=hash(salt+newPassword);

		this.meta={salt,password};
	}

	checkPassword(password) {
		if (this.method!="email")
			throw new Error("Wrong method");

		return (this.meta.password==hash(this.meta.salt+password));
	}

	assertPassword(password) {
		if (!this.checkPassword(password))
			throw new Error("Wrong password.");
	}
}

export default class User extends Model {
	static tableName="User";

	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY",
		role: "VARCHAR(64) NOT NULL"
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
