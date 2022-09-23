import {catnip, delay, buildUrl, apiFetch} from "catnip";
import {getCapsByRole} from "./rolecaps.js";
import User, {UserAuthMethod} from "./User.js";

catnip.addApi("/api/deleteAccount",async (params, sreq)=>{
	sreq.assertCap("user");
	let user=sreq.getUser();

	let userAuthMethods=await UserAuthMethod.findMany({
		userId: user.id
	});

	for (let userAuthMethod of userAuthMethods)
		await userAuthMethod.delete();

	await user.delete();
	await catnip.setSessionValue(sreq.sessionId,null);
});

catnip.addApi("/api/getAllUsers",async ({}, sess)=>{
	sess.assertCap("manage-users");

	return catnip.db.User.findMany();
});

catnip.addApi("/api/getUser",async ({id}, sess)=>{
	sess.assertCap("manage-users");
	let u=await catnip.db.User.findOne({id: id});

	return u;
});

catnip.addApi("/api/saveUser",async ({id, email, password, role}, sess)=>{
	sess.assertCap("manage-users");
	let u;

	if (id)
		u=await catnip.db.User.findOne({id: id});

	else
		u=new catnip.db.User();

	u.role=role;
	u.email=email;
	u.password=password;
	await u.save();

	return u;
});

catnip.addApi("/api/deleteUser",async ({id}, sess)=>{
	sess.assertCap("manage-users");
	let u=await catnip.db.User.findOne({id: id});
	await u.delete();
});

catnip.addApi("/api/authMethodStatus",async ({},req)=>{
	let user=req.getUser();
	if (!user)
		throw new Error("Not logged in");

	await user.populateAuthMethods();

	let authMethods=[];
	await catnip.doActionAsync("authMethods",authMethods,req);
	for (let authMethod of authMethods) {
		if (user.authMethods[authMethod.id])
			authMethod.token=user.authMethods[authMethod.id].token;
	}

	return authMethods;
});

catnip.addApi("/api/logout",async ({}, req)=>{
	await catnip.setSessionValue(req.sessionId,null);
});

catnip.addApi("/api/unlinkAuthMethod",async ({methodId}, req)=>{
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

catnip.addApi("/api/install",async ({email, password, repeatPassword}, req)=>{
	if (!catnip.getSetting("install"))
		throw new Error("Not install mode");

	if (await catnip.db.User.findOneByAuth("email",email))
		throw new Error("The email is already in use");

	if (!email)
		throw new Error("Invalid email");

	if (password!=repeatPassword)
		throw new Error("The passwords don't match");

	let user=new catnip.db.User();
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

	await catnip.setSessionValue(req.sessionId,user.id);
	await user.populateAuthMethods();
	await catnip.setSetting("install",false);

	return user;
});