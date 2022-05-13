import LoginPage from "./components/LoginPage.jsx";
import SignupPage from "./components/SignupPage.jsx";
import AccountPage from "./components/AccountPage.jsx";
import UserAdmin from "./components/UserAdmin.jsx";
import {catnip, delay} from "catnip";
import PEOPLE from "bootstrap-icons/icons/people.svg";
import {getCapsByRole} from "./rolecaps.js";
import User from "./src/User.js";

catnip.addModel(User);

catnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Users",
		href: "/admin/user",
		priority: 30,
		icon: PEOPLE
	});
});

catnip.addRoute("login",LoginPage);
catnip.addRoute("signup",SignupPage);
catnip.addRoute("account",AccountPage);
catnip.addRoute("admin/user",UserAdmin);

catnip.addAction("initSessionRequest",async (sessionRequest)=>{
	if (sessionRequest.getUserId())
		sessionRequest.user=await User.findOne(sessionRequest.getUserId());

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
		clientSession.user={
			id: u.id,
			email: u.email
		};
	}
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

catnip.addApi("/api/signup",async ({login, password, repeatPassword})=>{
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

	await sessionRequest.setUserId(u.id);

	return {
		user: {
			id: u.id,
			email: u.email
		}
	}
});

catnip.addApi("/api/logout",async ({}, sessionRequest)=>{
	await sessionRequest.setUserId();
});