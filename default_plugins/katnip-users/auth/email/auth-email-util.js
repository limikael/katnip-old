import nodeCrypto from "crypto";
//import {UserAuthMethod} from "../../src/User.js";

function hash(v) {
	return nodeCrypto.createHash("sha256").update(v).digest().toString("hex");			
}

async function ensureEmailAuthMethod(user) {
	if (!user.authMethods.email) {
		if (!user.id)
			throw new Error("User not saved");

		user.authMethods.email=new UserAuthMethod({
			userId: user.id,
			method: "email"
		})
	}
}

export async function setPassword(user, newPassword) {
	ensureEmailAuthMethod(user);
	let userAuthMethod=user.authMethods.email;

	if (!newPassword || newPassword.length<6)
		throw new Error("The password is too short");

	let salt=hash(nodeCrypto.randomBytes(64));
	let password=hash(salt+newPassword);

	userAuthMethod.meta={salt,password};
}

export function checkPassword(user, password) {
	let userAuthMethod=user.authMethods.email;
	if (!userAuthMethod)
		throw new Error("No password");

	return (userAuthMethod.meta.password==hash(userAuthMethod.meta.salt+password));
}

export function assertPassword(user, password) {
	if (!checkPassword(user, password))
		throw new Error("Wrong password.");
}
