import {katnip} from "katnip";
import User, {UserAuthMethod} from "../../src/User.js";

import nodeCrypto from "crypto";

function hash(v) {
	return nodeCrypto.createHash("sha256").update(v).digest().toString("hex");			
}

async function setPassword(user, newPassword) {
	let userAuthMethod=user.authMethods.password;
	if (!userAuthMethod)
		throw new Error("No password");

	if (!newPassword || newPassword.length<6)
		throw new Error("The password is too short");

	let salt=hash(nodeCrypto.randomBytes(64));
	let password=hash(salt+newPassword);

	userAuthMethod.meta={salt,password};
}

function checkPassword(user, password) {
	let userAuthMethod=user.authMethods.password;
	if (!userAuthMethod)
		throw new Error("No password");

	return (userAuthMethod.meta.password==hash(userAuthMethod.meta.salt+password));
}

function assertPassword(user, password) {
	if (!checkPassword(user, password))
		throw new Error("Wrong password.");
}

katnip.addAction("authMethods",(authMethods, req)=>{
	authMethods.push({
		id: "email",
		title: "Email and Password",
		element: "PasswordLoginElement",
		href: "/linkemail",
		priority: 10
	});
});

katnip.addApi("/api/changePassword",async (params, req)=>{
	let {oldPassword, newPassword, repeatNewPassword}=params;

	req.assertCap("user");
	let u=req.getUser();
	await u.populateAuthMethods();

	let emailAuth=u.authMethods.email;
	if (!emailAuth)
		throw new Error("no email auth method");

	emailAuth.assertPassword(oldPassword);
	if (newPassword!=repeatNewPassword)
		throw new Error("The passwords don't match");

	await emailAuth.setPassword(newPassword);
	await emailAuth.save();
});

katnip.addApi("/api/changeEmail",async (params, req)=>{
	let {password, email}=params;

	req.assertCap("user");
	let u=req.getUser();
	await u.populateAuthMethods();

	let emailAuth=u.authMethods.email;
	if (!emailAuth)
		throw new Error("no email auth method");

	emailAuth.assertPassword(password);
	emailAuth.token=email;

	await emailAuth.save();
});

katnip.addApi("/api/login",async ({email, password}, req)=>{
	let user=await katnip.db.User.findOneByAuth("email", email);

	if (!user)
		throw new Error("Bad credentials.");

	await user.populateAuthMethods();
	user.authMethods["email"].assertPassword(password);
	await katnip.setSessionValue(req.sessionId,user.id);

	return user;
});

katnip.addApi("/api/signup",async ({email, password, repeatPassword}, req)=>{
	if (await User.findOneByAuth("email",email))
		throw new Error("The email is already in use");

	if (!email)
		throw new Error("Invalid email");

	if (password!=repeatPassword)
		throw new Error("The passwords don't match");

	let user=req.getUser();
	if (!user) {
		user=new katnip.db.User();
		user.role="user";
		await user.save();
	}

	let userAuthMethod=new UserAuthMethod({
		userId: user.id,
		method: "email",
		token: email
	});

	userAuthMethod.setPassword(password);
	await userAuthMethod.save();

	await katnip.setSessionValue(req.sessionId,user.id);
	await user.populateAuthMethods();

	return user;
});
