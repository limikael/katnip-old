import {katnip, delay, buildUrl, apiFetch} from "katnip";
import {getCapsByRole} from "./rolecaps.js";
import User, {UserAuthMethod} from "./User.js";
import fs from "fs";

katnip.addApi("/api/deleteAccount",async (params, sreq)=>{
	sreq.assertCap("user");
	let user=sreq.getUser();

	let userAuthMethods=await UserAuthMethod.findMany({
		userId: user.id
	});

	for (let userAuthMethod of userAuthMethods)
		await userAuthMethod.delete();

	await user.delete();
	await katnip.setSessionValue(sreq.sessionId,null);
});

katnip.addApi("/api/getAllUsers",async ({}, sess)=>{
	sess.assertCap("manage-users");

	return katnip.db.User.findMany();
});

katnip.addApi("/api/getUser",async ({id}, sess)=>{
	sess.assertCap("manage-users");
	let u=await katnip.db.User.findOne({id: id});

	return u;
});

katnip.addApi("/api/saveUser",async ({id, email, password, role}, sess)=>{
	sess.assertCap("manage-users");
	let u;

	if (id)
		u=await katnip.db.User.findOne({id: id});

	else
		u=new katnip.db.User();

	u.role=role;
	u.email=email;
	u.password=password;
	await u.save();

	return u;
});

katnip.addApi("/api/deleteUser",async ({id}, sess)=>{
	sess.assertCap("manage-users");
	let u=await katnip.db.User.findOne({id: id});
	await u.delete();
});

katnip.addApi("/api/authMethodStatus",async ({},req)=>{
	let user=req.getUser();
	if (!user)
		throw new Error("Not logged in");

	await user.populateAuthMethods();

	let authMethods=[];
	await katnip.doActionAsync("authMethods",authMethods,req);
	for (let authMethod of authMethods) {
		if (user.authMethods[authMethod.id])
			authMethod.token=user.authMethods[authMethod.id].token;
	}

	return authMethods;
});

katnip.addApi("/api/logout",async ({}, req)=>{
	await katnip.setSessionValue(req.sessionId,null);
});

katnip.addApi("/api/unlinkAuthMethod",async ({methodId}, req)=>{
	let user=req.getUser();
	if (!user)
		throw new Error("Not logged in");

	if (await UserAuthMethod.getCount({userId: user.id})<=1)
		throw new Error("Can't unlink last method");

	let userAuthMethod=await UserAuthMethod.findOne({
		userId: user.id,
		method: methodId
	});

	await userAuthMethod.delete();

	await user.populateAuthMethods();
	return user;
});

katnip.addApi("/api/installDb",async({driver, filename, host, user, pass, name}, req)=>{
	if (!katnip.getSetting("install"))
		throw new Error("Not install mode");

	console.log("Installing database...");

	let dsn;
	switch (driver) {
		case "sqlite3":
			dsn="sqlite3:"+filename;
			break;

		case "mysql":
			dsn="mysql://"+user+":"+pass+"@"+host+"/"+name;
			break;
	}

	await katnip.verifyDsn(dsn);

	let env="";
	if (fs.existsSync(process.cwd()+"/.env"))
		env=fs.readFileSync(process.cwd()+"/.env","utf8");

	env+="\nDSN="+dsn+"\n";
	fs.writeFileSync(process.cwd()+"/.env",env);

	await katnip.restart();
});

katnip.addApi("/api/install",async ({email, password, repeatPassword}, req)=>{
	if (!katnip.getSetting("install"))
		throw new Error("Not install mode");

	if (await katnip.db.User.findOneByAuth("email",email))
		throw new Error("The email is already in use");

	if (!email)
		throw new Error("Invalid email");

	if (password!=repeatPassword)
		throw new Error("The passwords don't match");

	let user=new katnip.db.User();
	user.email=email;
	user.role="admin";
	await user.save();

	let userAuthMethod=new UserAuthMethod({
		userId: user.id,
		method: "email",
		token: email
	});

	userAuthMethod.setPassword(password);
	await userAuthMethod.save();

	await katnip.setSessionValue(req.sessionId,user.id);
	await user.populateAuthMethods();
	await katnip.setSetting("install",false);

	return user;
});
