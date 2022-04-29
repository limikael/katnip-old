import {LoginPage, UserAdmin} from "./components.jsx";
import {catnip, Model} from "catnip";
import PEOPLE from "bootstrap-icons/icons/people.svg";

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

catnip.addAction("getClientSession",async (clientSession)=>{
	let [serverSession]=catnip.useSession();

	if (serverSession.uid) {
		let u=await catnip.db.User.findOne({id: serverSession.uid});
		clientSession.user={
			id: u.id,
			email: u.email
		};
	}
});

catnip.addApi("/api/getAllUsers",async ()=>{
	let [session]=catnip.useSession();
	if (!session.uid)
		throw new Error("not logged in...");

	return catnip.db.User.findMany();
});

catnip.addApi("/api/getUser",async ({id})=>{
	let u=await catnip.db.User.findOne({id: id});

	return u;
});

catnip.addApi("/api/saveUser",async ({id, email, password})=>{
	let u;

	if (id)
		u=await catnip.db.User.findOne({id: id});

	else
		u=new catnip.db.User();

	u.role="subscriber";
	u.email=email;
	u.password=password;
	await u.save();

	return {id: u.id};
});

catnip.addApi("/api/deleteUser",async ({id})=>{
	let u=await catnip.db.User.findOne({id: id});
	await u.delete();
});

catnip.addApi("/api/login",async ({login, password})=>{
	let [session,setSession]=catnip.useSession();

	let u=await catnip.db.User.findOne({
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

catnip.addApi("/api/logout",async ({})=>{
	let [session,setSession]=catnip.useSession();

	await setSession({
		uid: null
	});
});