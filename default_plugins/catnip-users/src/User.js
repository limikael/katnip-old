import {catnip, Model} from "catnip";
//import crypto from "crypto";

function hash(v) {
	return crypto.createHash("sha256").update(v).digest().toString("hex");			
}

export default class User extends Model {
	static tableName="User";

	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		email: "VARCHAR(255) NOT NULL",
		password: "VARCHAR(255) NULL",
		salt: "VARCHAR(255) NULL",
		role: "VARCHAR(64) NOT NULL",
	};

	setPassword(newPassword) {
		if (!newPassword || newPassword.length<6)
			throw new Error("The password is too short");

		this.salt=hash(crypto.randomBytes(64));
		this.password=hash(this.salt+newPassword);
	}

	checkPassword(password) {
		if (!this.password)
			return false;

		return (this.password==hash(this.salt+password));
	}

	assertPassword(password) {
		if (!this.checkPassword(password))
			throw new Error("Wrong password.");
	}
}
