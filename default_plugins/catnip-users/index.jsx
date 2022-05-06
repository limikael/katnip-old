import {LoginPage, UserAdmin} from "./components.jsx";
import {catnip, Model} from "catnip";
import PEOPLE from "bootstrap-icons/icons/people.svg";
import {getCapsByRole} from "./rolecaps.js";

class User extends Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		email: "VARCHAR(255) NOT NULL",
		password: "VARCHAR(255) NOT NULL",
		role: "VARCHAR(64) NOT NULL",
	};
}

catnip.addModel(User);

catnip.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Users",
		href: "/admin/user",
		priority: 30,
		icon: PEOPLE
	});
});

catnip.addAction("getPageComponent",(request)=>{
	switch (request.path) {
		case "/login":
			return LoginPage;

		case "/admin/user":
			return UserAdmin;
	}
});

catnip.addAction("initSessionRequest",async (sessionRequest)=>{
	if (sessionRequest.getUserId())
		sessionRequest.user=await User.findOne(sessionRequest.getUserId());

	sessionRequest.assertCap=(cap)=>{
		let caps=getCapsByRole(sessionRequest.user.role);
		if (!caps.includes(cap))
			throw new Error("Not authorized.");
	}
});

catnip.addAction("getClientSession",async (clientSession, sessionRequest)=>{
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
	let u=await catnip.db.User.findOne({
		email: login,
		password: password
	});

	if (!u)
		throw new Error("Bad credentials.");

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