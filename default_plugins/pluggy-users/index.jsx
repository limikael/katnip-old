import {LoginPage, UserAdmin} from "./components.jsx";
import {pluggy, Model} from "pluggy";
import PEOPLE from "bootstrap-icons/icons/people.svg";

class User extends Model {
	static fields={
		id: "INTEGER NOT NULL AUTO_INCREMENT",
		email: "VARCHAR(255) NOT NULL",
		password: "VARCHAR(255) NOT NULL",
		role: "VARCHAR(64) NOT NULL",
	};
}

pluggy.addModel(User);

pluggy.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Users",
		href: "/admin/user",
		priority: 30,
		icon: PEOPLE
	});
});

pluggy.addAction("getPageComponent",(request)=>{
	switch (request.path) {
		case "/login":
			return LoginPage;

		case "/admin/user":
			return UserAdmin;
	}
});

pluggy.addAction("getClientSession",async (clientSession)=>{
	let [serverSession]=pluggy.useSession();

	if (serverSession.uid) {
		let u=await pluggy.db.User.findOne({id: serverSession.uid});
		clientSession.user={
			id: u.id,
			email: u.email
		};
	}
});

pluggy.addApi("/api/getAllUsers",async ()=>{
	let [session]=pluggy.useSession();
	if (!session.uid)
		throw new Error("not logged in...");

	return pluggy.db.User.findMany();
});

pluggy.addApi("/api/getUser",async ({id})=>{
	let u=await pluggy.db.User.findOne({id: id});

	return u;
});

pluggy.addApi("/api/saveUser",async ({id, email, password})=>{
	let u;

	if (id)
		u=await pluggy.db.User.findOne({id: id});

	else
		u=new pluggy.db.User();

	u.role="subscriber";
	u.email=email;
	u.password=password;
	await u.save();

	return {id: u.id};
});

pluggy.addApi("/api/deleteUser",async ({id})=>{
	let u=await pluggy.db.User.findOne({id: id});
	await u.delete();
});

pluggy.addApi("/api/login",async ({login, password})=>{
	let [session,setSession]=pluggy.useSession();

	let u=await pluggy.db.User.findOne({
		email: login,
		password: password
	});

	if (!u)
		throw new Error("Bad credentials.");

	await setSession({
		uid: u.id
	});

	return {
		user: {
			id: u.id,
			email: u.email
		}
	}
});

pluggy.addApi("/api/logout",async ({})=>{
	let [session,setSession]=pluggy.useSession();

	await setSession({
		uid: null
	});
});