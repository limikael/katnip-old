import {katnip, delay, buildUrl, apiFetch, assertForm, User} from "katnip";
import {setPassword} from "../auth/email/auth-email-util.js";
import fs from "fs";

katnip.addApi("/api/deleteAccount",async (params, req)=>{
	req.assertCap("user");
	let user=req.getUser();

	let userAuthMethods=await UserAuthMethod.findMany({
		userId: user.id
	});

	for (let userAuthMethod of userAuthMethods)
		await userAuthMethod.delete();

	await user.delete();
	await req.setUser(null);
});

katnip.addApi("/api/changeUsername",async (form, req)=>{
	req.assertCap("user");

	assertForm(form,{
		username: {validate: "username"}
	});

	let user=req.getUser();
	let u=await User.findOne({username: form.username});
	if (u && u.id!=user.id)
		throw new Error("The user id is already in use.");

	user.username=form.username;
	await user.save();

	await req.setUser(user);
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
			authMethod.active=true;
	}

	return authMethods;
});

katnip.addApi("/api/logout",async ({}, req)=>{
	await req.setUser(null);
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
	await req.setUser(user);
});

katnip.addApi("/api/installDb",async({driver, filename, host, user, pass, name}, req)=>{
	let dsn;
	switch (driver) {
		case "sqlite3":
			dsn="sqlite3:"+filename;
			break;

		case "mysql":
			dsn="mysql://"+user+":"+pass+"@"+host+"/"+name;
			break;
	}

	await katnip.installDb(dsn);
	req.piggybackChannel("redirect");
});

katnip.addApi("/api/installAdmin",async (form, req)=>{
	if (await User.findOne({role: "admin"}))
		throw new Error("There is already an admin");

	assertForm(form,{
		username: {validate: "username"},
		password: {validate: "password"}
	});

	if (await User.findOne({username: form.username}))
		throw new Error("The username is already in use");

	let user=new User();
	user.username=form.username;
	user.role="admin";
	await user.save();
	await user.populateAuthMethods();

	await setPassword(user,form.password);
	await user.authMethods.email.save();

	await req.setUser(user);
	await katnip.checkAdmin();
	req.piggybackChannel("redirect");
});
