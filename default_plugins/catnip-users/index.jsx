import LoginPage from "./components/LoginPage.jsx";
import SignupPage from "./components/SignupPage.jsx";
import AccountPage from "./components/AccountPage.jsx";
import UserAdmin from "./components/UserAdmin.jsx";
import InstallPage from "./components/InstallPage.jsx";
import {catnip, delay, buildUrl, apiFetch} from "catnip";
import PEOPLE from "bootstrap-icons/icons/people.svg";
import {getCapsByRole} from "./rolecaps.js";
import User from "./src/User.js";
import Auth from "./components/Auth.jsx";

catnip.addModel(User);

catnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Users",
		href: "/admin/user",
		priority: 30,
		icon: PEOPLE
	});
});

catnip.addRoute("install",InstallPage);
catnip.addRoute("login",LoginPage);
catnip.addRoute("signup",SignupPage);
catnip.addRoute("account",AccountPage);
catnip.addRoute("admin/user",UserAdmin);
catnip.addRoute("auth",Auth);

catnip.addSetting("install");

catnip.addSettingCategory("auth",{title: "Authorization", priority: 15});
catnip.addSetting("googleClientId",{title: "Google Client Id", category: "auth"});
catnip.addSetting("googleClientSecret",{title: "Google Client Secret", category: "auth"});

function createGoogleAuthClient(origin) {
	return new ClientOAuth2({
		clientId: catnip.getSetting("googleClientId"),
		clientSecret: catnip.getSetting("googleClientSecret"),
		accessTokenUri: 'https://oauth2.googleapis.com/token',
		authorizationUri: 'https://accounts.google.com/o/oauth2/auth',
		redirectUri: origin+'/auth',
		scopes: ['https://www.googleapis.com/auth/userinfo.email']
	});
}

catnip.addAction("initSessionRequest",async (sessionRequest)=>{
	if (sessionRequest.getUserId()) {
		sessionRequest.user=await User.findOne(sessionRequest.getUserId());
		if (!sessionRequest.user)
			sessionRequest.setUserId();
	}

	sessionRequest.getUser=()=>{
		return sessionRequest.user;
	}

	sessionRequest.assertCap=(cap)=>{
		if (!sessionRequest.user)
			throw new Error("Not authorized.");

		let caps=getCapsByRole(sessionRequest.user.role);
		if (!caps.includes(cap))
			throw new Error("Not authorized.");
	}
});

catnip.addAction("getClientSession",async (clientSession, sessionRequest)=>{
	clientSession.cookie=sessionRequest.cookie;
	if (sessionRequest.uid) {
		let u=await catnip.db.User.findOne({id: sessionRequest.uid});
		if (u) {
			clientSession.user={
				id: u.id,
				email: u.email
			};
		}
	}

	if (catnip.getSetting("install"))
		clientSession.redirect="/install";

	if (catnip.getSetting("googleClientId") &&
			catnip.getSetting("googleClientSecret"))
		clientSession.googleAuthUrl=createGoogleAuthClient(sessionRequest.origin).code.getUri();
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

	u=new User();
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

	let user=await User.findOne({email: tokenInfo.email});
	if (!user) {
		user=new User();
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

	if (await User.findOne({email: email}))
		throw new Error("The email is already in use");

	if (!email)
		throw new Error("Invalid email");

	if (password!=repeatPassword)
		throw new Error("The passwords don't match");

	u=new User();
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

catnip.addAction("serverMain",async (options)=>{
	if (options.createadmin) {
		let [email,password]=options.createadmin.split(":");
		if (await User.findOne({email: email})) {
			console.log("Admin user exists alreay...");
		}

		else {
			u=new User({
				email: email,
				role: "admin"
			});
			u.setPassword(password);
			await u.save();
			console.log("Admin user created.");
		}
	}

	if (!await User.findOne({role: "admin"})) {
		console.log("No admin user, entering install mode.")
		await catnip.setSetting("install",true);
	}

	else
		await catnip.setSetting("install",false);
});