import {katnip, delay, buildUrl, apiFetch} from "katnip";
import {getCapsByRole} from "./rolecaps.js";
import User, {UserAuthMethod} from "./User.js";

katnip.addApi("/api/deleteAccount",async (req)=>{
	req.assertCap("user");
	let user=req.getUser();

	let userAuthMethods=await UserAuthMethod.findMany({
		userId: user.id
	});

	for (let userAuthMethod of userAuthMethods)
		await userAuthMethod.delete();

	await user.delete();
	await katnip.setSessionValue(req.sessionId,null);
});

katnip.addApi("/api/getAllUsers",async (req)=>{
	req.assertCap("manage-users");

	return katnip.db.User.findMany();
});

katnip.addApi("/api/getUser",async (req)=>{
	let {id}=req.query;

	req.assertCap("manage-users");
	let u=await katnip.db.User.findOne({id: id});

	return u;
});

katnip.addApi("/api/saveUser",async (req)=>{
	let {id, email, password, role}=req.query;

	req.assertCap("manage-users");
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

katnip.addApi("/api/deleteUser",async (req)=>{
	let {id}=req.query;

	req.assertCap("manage-users");
	let u=await katnip.db.User.findOne({id: id});
	await u.delete();
});

katnip.addApi("/api/authMethodStatus",async (req)=>{
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

katnip.addApi("/api/logout",async (req)=>{
	await katnip.setSessionValue(req.sessionId,null);
});

katnip.addApi("/api/unlinkAuthMethod",async (req)=>{
	let {methodId}=req.query;

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

katnip.addApi("/api/install",async (req)=>{
	let {email, password, repeatPassword}=req.query;

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
