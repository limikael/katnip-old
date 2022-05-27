import {catnip, delay, buildUrl, apiFetch} from "catnip";
import {getCapsByRole} from "./rolecaps.js";
import {createGoogleAuthClient} from "./auth.js";

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

catnip.addApi("/api/login",async ({login, password}, sessionRequest)=>{
	let u=await catnip.db.User.findOne({email: login});

	if (!u)
		throw new Error("Bad credentials.");

	u.assertPassword(password);

	await sessionRequest.setUserId(u.id);

	return {
		user: {
			id: u.id,
			email: u.email
		}
	}
});

catnip.addApi("/api/signup",async ({login, password, repeatPassword},sreq)=>{
	if (await User.findOne({email: login}))
		throw new Error("The email is already in use");

	if (!login)
		throw new Error("Invalid email");

	if (password!=repeatPassword)
		throw new Error("The passwords don't match");

	u=new catnip.db.User();
	u.email=login;
	u.setPassword(password);
	u.role="user";
	await u.save();

	await sreq.setUserId(u.id);
	return {
		user: {
			id: u.id,
			email: u.email
		}
	}
});

catnip.addApi("/api/auth",async ({url}, sreq)=>{
	let res=await createGoogleAuthClient(sreq.origin).code.getToken(url);

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

	await sreq.setUserId(user.id);
	return {
		user: {
			id: user.id,
			email: user.email
		}
	}
});

catnip.addApi("/api/logout",async ({}, sessionRequest)=>{
	await sessionRequest.setUserId();
});

catnip.addApi("/api/install",async ({email, password, repeatPassword}, sreq)=>{
	if (!catnip.getSetting("install"))
		throw new Error("Not install mode");

	if (await catnip.db.User.findOne({email: email}))
		throw new Error("The email is already in use");

	if (!email)
		throw new Error("Invalid email");

	if (password!=repeatPassword)
		throw new Error("The passwords don't match");

	u=new catnip.db.User();
	u.email=email;
	u.setPassword(password);
	u.role="admin";
	await u.save();
	await sreq.setUserId(u.id);

	await catnip.setSetting("install",false);

	return {
		user: {
			id: u.id,
			email: u.email
		}
	}
});
