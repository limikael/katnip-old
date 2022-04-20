import LoginPage from "./components/LoginPage.jsx";
import {ListUsers, EditUser} from "./components/UserAdmin.jsx";
import pluggy from "pluggy";
import User from "./model/User.js";

pluggy.addAction("getAdminMenu",(items)=>{
	items.push({
		title: "Users",
		href: "/admin/users",
		routes: ["/admin/user"],
		priority: 30
	});
});

pluggy.addAction("getPageComponent",(request)=>{
	switch (request.path) {
		case "/login":
			return LoginPage;

		case "/admin/users":
			return ListUsers;

		case "/admin/user":
			return EditUser;
	}
});

pluggy.addModel(User);

pluggy.addApi("/api/getAllUsers",async ()=>{
	let session=pluggy.useSession();
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

pluggy.addApi("/api/login",async({login, password})=>{
	let session=pluggy.useSession();

	let u=await pluggy.db.User.findOne({
		email: login,
		password: password
	});

	if (!u)
		throw new Error("Bad credentials.");

	session.uid=u.id;
});