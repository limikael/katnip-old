import {catnip, delay, buildUrl, apiFetch} from "catnip";
import {getCapsByRole} from "./rolecaps.js";
import {createGoogleAuthClient} from "./auth.js";
import User from "./User.js";

catnip.addApi("/api/deleteAccount",async (params, sreq)=>{
	sreq.assertCap("user");
	let u=sreq.getUser();

	u.assertPassword(params.password);
	await u.delete();
	await catnip.setSessionValue(sreq.sessionId,null);
});

catnip.addApi("/api/changeEmail",async (params, sreq)=>{
	sreq.assertCap("user");
	let u=sreq.getUser();
	u.assertPassword(params.password);

	if (u.email==params.email)
		return;

	if (await User.findOne({email: params.email}))
		throw new Error("The email is already in use");

	u.email=params.email;
	await u.save();
});

catnip.addApi("/api/changePassword",async (params, sreq)=>{
	sreq.assertCap("user");
	let u=sreq.getUser();

	u.assertPassword(params.oldPassword);
	if (params.newPassword!=params.repeatNewPassword)
		throw new Error("The passwords don't match");

	await u.setPassword(params.newPassword);
	await u.save();
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

	return {id: u.id};
});

catnip.addApi("/api/deleteUser",async ({id}, sess)=>{
	sess.assertCap("manage-users");
	let u=await catnip.db.User.findOne({id: id});
	await u.delete();
});

catnip.addApi("/api/login",async ({login, password}, req)=>{
	let u=await catnip.db.User.findOne({email: login});

	if (!u)
		throw new Error("Bad credentials.");

	u.assertPassword(password);

	await catnip.setSessionValue(req.sessionId,u.id);

	return {
		user: {
			id: u.id,
			email: u.email
		}
	}
});

catnip.addApi("/api/useToken",async ({token}, req)=>{
	if (!token)
		throw new Error("That's not a token");

	let u=await catnip.db.User.findOne({token: token});

	if (!u) {
		u=new User({token: token});
		await u.save();
	}

	await catnip.setSessionValue(req.sessionId,u.id);

	return u;
});

catnip.addApi("/api/signup",async ({login, password, repeatPassword}, req)=>{
	if (await User.findOne({email: login}))
		throw new Error("The email is already in use");

	if (!login)
		throw new Error("Invalid email");

	if (password!=repeatPassword)
		throw new Error("The passwords don't match");

	let u=new catnip.db.User();
	u.email=login;
	u.setPassword(password);
	u.role="user";
	await u.save();

	await catnip.setSessionValue(req.sessionId,u.id);

	return {
		user: {
			id: u.id,
			email: u.email
		}
	}
});

catnip.addApi("/api/auth",async ({url}, req)=>{
	let res=await createGoogleAuthClient(req.origin).code.getToken(url);

	let googleApiUrl=buildUrl("https://oauth2.googleapis.com/tokeninfo",{
		id_token: res.data.id_token
	});

	let tokenInfo=await apiFetch(googleApiUrl);
	if (!tokenInfo.email)
		throw new Error("Unable to login with google");

	let user=await catnip.db.User.findOne({email: tokenInfo.email});
	if (!user) {
		user=new catnip.db.User();
		user.email=tokenInfo.email;
		user.role="user";
		await user.save();
	}

	await catnip.setSessionValue(req.sessionId,user.id);

	return {
		user: {
			id: user.id,
			email: user.email
		}
	}
});

catnip.addApi("/api/logout",async ({}, req)=>{
	await catnip.setSessionValue(req.sessionId,null);
});

catnip.addApi("/api/install",async ({email, password, repeatPassword}, req)=>{
	if (!catnip.getSetting("install"))
		throw new Error("Not install mode");

	if (await catnip.db.User.findOne({email: email}))
		throw new Error("The email is already in use");

	if (!email)
		throw new Error("Invalid email");

	if (password!=repeatPassword)
		throw new Error("The passwords don't match");

	let u=new catnip.db.User();
	u.email=email;
	u.setPassword(password);
	u.role="admin";
	await u.save();
	await catnip.setSessionValue(req.sessionId,u.id);

	await catnip.setSetting("install",false);

	return {
		user: {
			id: u.id,
			email: u.email
		}
	}
});
